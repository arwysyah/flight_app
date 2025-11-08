import React from 'react';
import { AuthState, AuthAction } from '../types/auth';

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null };

    case 'AUTH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload,
        error: null,
      };

    case 'AUTH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: action.payload,
      };

    case 'AUTH_LOGOUT':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: null,
      };

    case 'AUTH_CLEAR_ERROR':
      return { ...state, error: null };

    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
};

const AuthStateContext = React.createContext<AuthState | undefined>(undefined);
const AuthDispatchContext = React.createContext<
  React.Dispatch<AuthAction> | undefined
>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = React.memo(
  ({ children }) => {
    const [state, dispatch] = React.useReducer(authReducer, initialState);

    const memoizedState = React.useMemo(() => state, [state]);

    return (
      <AuthStateContext.Provider value={memoizedState}>
        <AuthDispatchContext.Provider value={dispatch}>
          {children}
        </AuthDispatchContext.Provider>
      </AuthStateContext.Provider>
    );
  },
);

AuthProvider.displayName = 'AuthProvider';

export const useAuthState = () => {
  const context = React.useContext(AuthStateContext);
  if (context === undefined) {
    throw new Error('useAuthState must be used within an AuthProvider');
  }
  return context;
};

export const useAuthDispatch = () => {
  const context = React.useContext(AuthDispatchContext);
  if (context === undefined) {
    throw new Error('useAuthDispatch must be used within an AuthProvider');
  }
  return context;
};
