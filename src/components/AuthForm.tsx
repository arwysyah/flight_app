import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { wp, fs, spacing } from '../utils/responsive';

interface AuthFormProps {
  type: 'signin' | 'signup';
  onSubmit: (credentials: {
    email: string;
    password: string;
    name?: string;
  }) => void | Promise<void>;
  isLoading: boolean;
  error?: string | null;
  onClearError: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = React.memo(
  ({ type, onSubmit, isLoading, error, onClearError }) => {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [name, setName] = React.useState('');

    const isSignUp = type === 'signup';

    const handleSubmit = React.useCallback(() => {
      const credentials = isSignUp
        ? { email, password, name }
        : { email, password };
      onSubmit(credentials);
    }, [email, password, name, isSignUp, onSubmit]);

    const isFormValid = React.useMemo(() => {
      if (isSignUp) {
        return email.trim() && password.length >= 6 && name.trim();
      }
      return email.trim() && password.length >= 6;
    }, [email, password, name, isSignUp]);

    React.useEffect(() => {
      if (error) {
        onClearError();
      }
    }, [email, password, name, error, onClearError]);

    return (
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.form}>
            <View style={styles.header}>
              <Text style={styles.title}>
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </Text>
              <Text style={styles.subtitle}>
                {isSignUp
                  ? 'Sign up to start searching flights'
                  : 'Sign in to your account'}
              </Text>
            </View>

            {isSignUp && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your full name"
                  placeholderTextColor="#999"
                  autoCapitalize="words"
                  editable={!isLoading}
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#999"
                secureTextEntry
                autoCapitalize="none"
                editable={!isLoading}
              />
              {isSignUp && (
                <Text style={styles.passwordHint}>
                  Must be at least 6 characters with uppercase and lowercase
                  letters
                </Text>
              )}
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.submitButton,
                (!isFormValid || isLoading) && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  },
);

AuthForm.displayName = 'AuthForm';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  form: {
    backgroundColor: 'white',
    borderRadius: wp(20),
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fs(28),
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fs(16),
    color: '#666',
    textAlign: 'center',
    lineHeight: fs(20),
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fs(16),
    fontWeight: '600',
    marginBottom: spacing.sm,
    color: '#333',
  },
  input: {
    borderWidth: 2,
    borderColor: '#e1e5e9',
    borderRadius: wp(12),
    padding: spacing.md,
    fontSize: fs(16),
    backgroundColor: 'white',
    color: '#333',
  },
  passwordHint: {
    fontSize: fs(12),
    color: '#666',
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  errorContainer: {
    backgroundColor: '#ffe6e6',
    borderLeftWidth: 4,
    borderLeftColor: '#ff4444',
    padding: spacing.md,
    borderRadius: wp(8),
    marginBottom: spacing.lg,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: fs(14),
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: wp(12),
    padding: spacing.md + spacing.xs / 2,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: 'white',
    fontSize: fs(18),
    fontWeight: '600',
  },
});
