import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/contexts/AppContext';
import { theme } from '@/constants/theme';

export default function SignupScreen() {
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const { signup } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleSignup = async () => {
    if (!fullName || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const result = await signup(fullName, email, password);
      
      if (result?.user?.identities?.length === 0) {
        setError('This email is already registered. Please log in instead.');
        setLoading(false);
        return;
      }
      
      if (result?.user && !result?.session) {
        setSuccess('Account created! Please check your email to confirm your account before logging in.');
        setLoading(false);
        setTimeout(() => {
          router.replace('/login');
        }, 3000);
      } else {
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to sign up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <KeyboardAvoidingView
        style={[styles.container, { paddingTop: insets.top }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + theme.spacing.xl }]}
          keyboardShouldPersistTaps="handled"
        >
        <View style={styles.logoContainer}>
          <View style={styles.iconWrapper}>
            <LinearGradient
              colors={['#FF6900', '#FF6900']}
              style={styles.iconGradient}
            >
              <View style={styles.basketballIcon}>
                <View style={styles.basketballLine} />
                <View style={[styles.basketballLine, styles.basketballLineHorizontal]} />
              </View>
            </LinearGradient>
            <View style={styles.glow} />
          </View>
          <Text style={styles.title}>Courtside</Text>
          <Text style={styles.subtitle}>Your complete basketball team management platform</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              placeholderTextColor={theme.colors.textSecondary}
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={theme.colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={theme.colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {success ? <Text style={styles.successText}>{success}</Text> : null}

          <TouchableOpacity
            style={[styles.signupButton, loading && styles.signupButtonDisabled]}
            onPress={handleSignup}
            activeOpacity={0.8}
            disabled={loading}
          >
            <LinearGradient
              colors={['#FF6900', '#FF6900']}
              style={styles.signupButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.signupButtonText}>{loading ? 'Signing up...' : 'Sign Up'}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.loginPrompt}
          >
            <Text style={styles.loginPromptText}>
              Already have an account? <Text style={styles.loginLink}>Log in</Text>
            </Text>
          </TouchableOpacity>
        </View>

          <Text style={styles.terms}>
            By continuing, you agree to our Terms of Service and{`\n`}Privacy Policy
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 60,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconWrapper: {
    position: 'relative' as const,
    marginBottom: theme.spacing.lg,
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute' as const,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FF6900',
    opacity: 0.4,
    shadowColor: '#FF6900',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 40,
    elevation: 20,
  },
  basketballIcon: {
    width: 50,
    height: 50,
    position: 'relative' as const,
  },
  basketballLine: {
    position: 'absolute' as const,
    width: 2,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    left: 24,
  },
  basketballLineHorizontal: {
    width: 50,
    height: 2,
    left: 0,
    top: 24,
  },
  title: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: '700' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center' as const,
  },
  formContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.fontSize.md,
    fontWeight: '500' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  signupButton: {
    marginTop: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden' as const,
    shadowColor: '#FF6900',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  signupButtonGradient: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  signupButtonText: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700' as const,
    color: theme.colors.text,
  },
  loginPrompt: {
    marginTop: theme.spacing.lg,
    alignItems: 'center',
  },
  loginPromptText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  loginLink: {
    color: theme.colors.primary,
    fontWeight: '600' as const,
  },
  terms: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 18,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.xs,
    textAlign: 'center' as const,
  },
  successText: {
    color: '#34C759',
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.xs,
    textAlign: 'center' as const,
    paddingHorizontal: theme.spacing.sm,
  },
  signupButtonDisabled: {
    opacity: 0.6,
  },
});
