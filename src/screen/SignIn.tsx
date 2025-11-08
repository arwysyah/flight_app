import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthForm } from '../components/AuthForm';
import { useAuth } from '../hooks/useAuth';
import { fs, spacing, wp } from '../utils/responsive';
import { SafeAreaView } from 'react-native-safe-area-context';

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
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#1a73e8" />
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.headerGradient}>
              <View style={styles.header}>
                <View>
                  <Text style={styles.greeting}>Welcome </Text>
                  <Text style={styles.subtitle}>Sign in to your account</Text>
                </View>
                <View style={styles.logoPlaceholder}>
                  <Text style={styles.logoText}>FlightApp</Text>
                </View>
              </View>
            </View>

            <View style={styles.authHeader}>
              <Text style={styles.authTitle}>Sign In</Text>
            </View>

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
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  },
);

SignInScreen.displayName = 'SignInScreen';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1a73e8',
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  headerGradient: {
    backgroundColor: '#1a73e8',
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: wp(24),
    borderBottomRightRadius: wp(24),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  greeting: {
    fontSize: fs(26),
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: spacing.xs / 2,
  },
  subtitle: {
    fontSize: fs(15),
    color: 'rgba(255, 255, 255, 0.9)',
  },
  logoPlaceholder: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: wp(20),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: fs(13),
  },
  authCard: {
    marginHorizontal: spacing.lg,
    marginTop: -spacing.lg - spacing.md,
    padding: spacing.lg,
    backgroundColor: '#ffffff',
    borderRadius: wp(20),
    shadowColor: '#1a73e8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  authHeader: {
    alignItems: 'center',
    // marginBottom: spacing.lg,
  },
  authTitle: {
    fontSize: fs(24),
    fontWeight: 'bold',
    color: '#202124',
    marginBottom: spacing.sm,
  },
  authSubtitle: {
    fontSize: fs(14),
    color: '#5f6368',
    textAlign: 'center',
    lineHeight: fs(20),
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: spacing.lg,
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#e8eaed',
  },
  footerText: {
    color: '#5f6368',
    fontSize: fs(15),
  },
  footerLink: {
    color: '#1a73e8',
    fontSize: fs(15),
    fontWeight: '600',
  },
  featuresSection: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.lg,
    backgroundColor: '#e8f0fe',
    borderRadius: wp(16),
    borderWidth: 1,
    borderColor: '#d2e3fc',
  },
  featuresTitle: {
    fontSize: fs(16),
    fontWeight: 'bold',
    color: '#1a73e8',
    marginBottom: spacing.sm + spacing.xs,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  featureDot: {
    fontSize: fs(16),
    color: '#1a73e8',
    marginRight: spacing.sm,
    fontWeight: 'bold',
  },
  featureText: {
    flex: 1,
    fontSize: fs(14),
    color: '#174ea6',
    lineHeight: fs(20),
  },
});
