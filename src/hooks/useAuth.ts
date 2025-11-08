import { useCallback, useEffect } from 'react';
import { AuthCredentials, AuthUser } from '../types/auth';
import { authService } from '../services/auth';
import {
  useAuthState,
  useAuthDispatch,
  AuthProvider,
} from '../state/auth.state';

export const useAuth = () => {
  const state = useAuthState();
  const dispatch = useAuthDispatch();

  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          dispatch({ type: 'AUTH_SUCCESS', payload: user });
        }
      } catch {}
    };

    checkAuthState();
  }, [dispatch]);

  const signUp = useCallback(
    async (credentials: AuthCredentials) => {
      dispatch({ type: 'AUTH_START' });

      try {
        const user = await authService.signUp(credentials);
        dispatch({ type: 'AUTH_SUCCESS', payload: user });
        return user;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Sign up failed';
        dispatch({ type: 'AUTH_FAILURE', payload: message });
        throw error;
      }
    },
    [dispatch],
  );

  const signIn = useCallback(
    async (credentials: AuthCredentials) => {
      dispatch({ type: 'AUTH_START' });

      try {
        const user = await authService.signIn(credentials);
        dispatch({ type: 'AUTH_SUCCESS', payload: user });
        return user;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Sign in failed';
        dispatch({ type: 'AUTH_FAILURE', payload: message });
        throw error;
      }
    },
    [dispatch],
  );

  const signOut = useCallback(async () => {
    try {
      await authService.signOut();
      dispatch({ type: 'AUTH_LOGOUT' });
    } catch (error) {
      console.error('Sign out error:', error);

      dispatch({ type: 'AUTH_LOGOUT' });
    }
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch({ type: 'AUTH_CLEAR_ERROR' });
  }, [dispatch]);

  const updateProfile = useCallback(
    async (updates: Partial<AuthUser>) => {
      if (!state.user) throw new Error('No user logged in');

      try {
        const updatedUser = await authService.updateProfile(
          state.user.id,
          updates,
        );
        dispatch({ type: 'AUTH_SUCCESS', payload: updatedUser });
        return updatedUser;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Profile update failed';
        dispatch({ type: 'AUTH_FAILURE', payload: message });
        throw error;
      }
    },
    [state.user, dispatch],
  );

  return {
    user: state.user,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    error: state.error,

    signUp,
    signIn,
    signOut,
    clearError,
    updateProfile,
  };
};

export { AuthProvider };
