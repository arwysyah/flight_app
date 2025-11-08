import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthForm } from '../components/AuthForm';
import { useAuth } from '../hooks/useAuth';
import { fs, spacing } from '../utils/responsive';

type RootStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  FlightSearch: undefined;
};

type SignInScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SignIn'
>;

interface SignInScreenProps {
  navigation: SignInScreenNavigationProp;
}

export const SignInScreen: React.FC<SignInScreenProps> = React.memo(
  ({ navigation }) => {
    const { signIn, isLoading, error, clearError } = useAuth();

    const handleSignIn = React.useCallback(
      async (credentials: { email: string; password: string }) => {
        try {
          await signIn(credentials);
        } catch {
          console.log('ERROR');
        }
      },
      [signIn],
    );

    const navigateToSignUp = React.useCallback(() => {
      navigation.navigate('SignUp');
    }, [navigation]);

    return (
      <View style={styles.container}>
        <AuthForm
          type="signin"
          onSubmit={handleSignIn}
          isLoading={isLoading}
          error={error}
          onClearError={clearError}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={navigateToSignUp}>
            <Text style={styles.footerLink}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  },
);

SignInScreen.displayName = 'SignInScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: 'transparent',
  },
  footerText: {
    color: '#666',
    fontSize: fs(16),
  },
  footerLink: {
    color: '#007AFF',
    fontSize: fs(16),
    fontWeight: '600',
  },
});
