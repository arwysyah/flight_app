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

type SignUpScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SignUp'
>;

interface SignUpScreenProps {
  navigation: SignUpScreenNavigationProp;
}

export const SignUpScreen: React.FC<SignUpScreenProps> = React.memo(
  ({ navigation }) => {
    const { signUp, isLoading, error, clearError } = useAuth();

    const handleSignUp = React.useCallback(
      async (credentials: {
        email: string;
        password: string;
        name?: string;
      }) => {
        try {
          // Ensure name is provided for signup
          if (!credentials.name) {
            return;
          }
          await signUp({ ...credentials, name: credentials.name });
        } catch {
          // Error handled by auth hook
        }
      },
      [signUp],
    );

    const navigateToSignIn = React.useCallback(() => {
      navigation.navigate('SignIn');
    }, [navigation]);

    return (
      <View style={styles.container}>
        <AuthForm
          type="signup"
          onSubmit={handleSignUp}
          isLoading={isLoading}
          error={error}
          onClearError={clearError}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={navigateToSignIn}>
            <Text style={styles.footerLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  },
);

SignUpScreen.displayName = 'SignUpScreen';

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
