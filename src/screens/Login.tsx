import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, Apple, Chrome } from 'lucide-react-native';
import * as AppleAuthentication from 'expo-apple-authentication';

import { ROUTES } from '@/constants/routes';
import { t } from '@/i18n/i18n';
import { RootStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme/ThemeProvider';
import { FormTextInput } from '@/components/FormTextInput';
import { useAuth } from '@/stores/useAuth';
import { tokens } from '@/theme/tokens';

// -------------------- Zod Schema --------------------
const schema = z.object({
  email: z.string().email('Enter a valid email address.').min(1, 'Email is required.'),
  password: z.string().min(6, 'Password must be at least 6 characters.').min(1, 'Password is required.'),
});

type FormValues = z.infer<typeof schema>;
type LoginProps = NativeStackScreenProps<RootStackParamList, 'Login'>;

export const LoginScreen: React.FC<LoginProps> = ({ navigation }) => {
  const theme = useTheme();
  const signIn = useAuth((state) => state.signIn);
  const signInWithApple = useAuth((state) => state.signInWithApple);
  const status = useAuth((state) => state.status);
  const error = useAuth((state) => state.error);

  const [isAppleAvailable, setIsAppleAvailable] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
  });

  // -------------------- Animations --------------------
  const fadeScreen = useRef(new Animated.Value(0)).current;
  const fadeHeader = useRef(new Animated.Value(0)).current;
  const fadeForm = useRef(new Animated.Value(0)).current;
  const fadeButton = useRef(new Animated.Value(0)).current;
  const fadeDivider = useRef(new Animated.Value(0)).current;
  const fadeSSO = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const checkAppleAvailability = async () => {
      const available = await AppleAuthentication.isAvailableAsync();
      setIsAppleAvailable(available);
    };
    checkAppleAvailability();

    Animated.sequence([
      Animated.timing(fadeScreen, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.timing(fadeHeader, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(fadeForm, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.timing(fadeButton, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(fadeDivider, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.timing(fadeSSO, { toValue: 1, duration: 350, useNativeDriver: true }),
    ]).start();
  }, []);

  // Slide-up interpolator
  const slide = (anim: Animated.Value) =>
    anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] });

  // -------------------- Handlers --------------------
  const isLoading = status === 'loading';

  const onSubmit = handleSubmit(async (values) => {
    try {
      await signIn(values);
      if (useAuth.getState().status === 'authenticated') {
        navigation.replace(ROUTES.Main);
      }
    } catch (err) {
      console.error('Sign in error:', err);
    }
  });

  const handleAppleSignIn = async () => {
    setAppleLoading(true);
    try {
      await signInWithApple();
      if (useAuth.getState().status === 'authenticated') {
        navigation.replace(ROUTES.Main);
      }
    } catch (err) {
      console.error('Apple sign in error:', err);
    } finally {
      setAppleLoading(false);
    }
  };

  // -------------------- UI --------------------
  return (
    <SafeAreaView 
      style={[styles.safeArea, { backgroundColor: tokens.colors.primaryBeige }]} 
      edges={['top', 'left', 'right']}
    >
      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          contentContainerStyle={styles.content} 
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          
          {/* Full screen fade-in */}
          <Animated.View style={{ opacity: fadeScreen, flex: 1 }}>

            {/* Header */}
            <Animated.View 
              style={{ 
                opacity: fadeHeader, 
                transform: [{ translateY: slide(fadeHeader) }] 
              }}
            >
              <View style={styles.header}>
                <Text style={[styles.title, { color: theme.semantic.text }]}>
                  {t('login.title')}
                </Text>
                <Text style={[styles.subtitle, { color: theme.semantic.textMuted }]}>
                  Track all your parcels in one dashboard.
                </Text>
              </View>
            </Animated.View>

            {/* Form Section */}
            <Animated.View 
              style={{ 
                opacity: fadeForm, 
                transform: [{ translateY: slide(fadeForm) }] 
              }}
            >
              <View style={styles.formContainer}>
                {/* Email */}
                <Controller
                  name="email"
                  control={control}
                  defaultValue=""
                  render={({ field: { value, onChange, onBlur } }) => (
                    <FormTextInput
                      label={t('login.emailPlaceholder')}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      errorMessage={errors.email?.message}
                      leftAccessory={<Mail color={theme.semantic.textMuted} size={18} />}
                    />
                  )}
                />

                {/* Password */}
                <Controller
                  name="password"
                  control={control}
                  defaultValue=""
                  render={({ field: { value, onChange, onBlur } }) => (
                    <FormTextInput
                      label={t('login.passwordPlaceholder')}
                      secureTextEntry
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      errorMessage={errors.password?.message}
                      leftAccessory={<Lock color={theme.semantic.textMuted} size={18} />}
                    />
                  )}
                />

                {/* Forgot password */}
                <Pressable 
                  style={styles.forgotLink} 
                  onPress={() => navigation.navigate(ROUTES.ForgotPassword)}
                >
                  <Text style={[styles.linkText, { color: theme.colors.accent }]}>
                    {t('login.forgotPassword')}
                  </Text>
                </Pressable>

                {/* Error message */}
                {error && (
                  <Text style={[styles.error, { color: theme.colors.error }]}>
                    {error}
                  </Text>
                )}
              </View>
            </Animated.View>

            {/* Login Button */}
            <Animated.View 
              style={{ 
                opacity: fadeButton, 
                transform: [{ translateY: slide(fadeButton) }] 
              }}
            >
              <Pressable
                disabled={isLoading}
                onPress={onSubmit}
                style={({ pressed }) => [
                  styles.primaryButton,
                  {
                    backgroundColor: tokens.colors.packageOrange,
                    opacity: pressed || isLoading ? 0.85 : 1,
                  },
                ]}
              >
                <Text style={styles.primaryLabel}>
                  {isLoading ? 'Signing in…' : t('login.cta')}
                </Text>
              </Pressable>
            </Animated.View>

            {/* Divider */}
            <Animated.View 
              style={{ 
                opacity: fadeDivider, 
                transform: [{ translateY: slide(fadeDivider) }] 
              }}
            >
              <View style={styles.divider}>
                <View style={[styles.line, { backgroundColor: theme.semantic.border }]} />
                <Text style={[styles.dividerText, { color: theme.semantic.textMuted }]}>
                  or
                </Text>
                <View style={[styles.line, { backgroundColor: theme.semantic.border }]} />
              </View>
            </Animated.View>

            {/* SSO Buttons */}
            <Animated.View 
              style={{ 
                opacity: fadeSSO, 
                transform: [{ translateY: slide(fadeSSO) }] 
              }}
            >
              <View style={styles.ssoGroup}>
                {/* Google */}
                <Pressable
                  disabled
                  style={[
                    styles.ssoButton,
                    { borderColor: theme.semantic.border, opacity: 0.5 },
                  ]}
                >
                  <Chrome color={theme.colors.textPrimary} size={20} />
                  <Text style={[styles.ssoLabel, { color: theme.semantic.text }]}>
                    Continue with Google
                  </Text>
                </Pressable>

                {/* Apple */}
                {isAppleAvailable && (
                  <Pressable
                    onPress={handleAppleSignIn}
                    disabled={appleLoading || isLoading}
                    style={({ pressed }) => [
                      styles.ssoButton,
                      {
                        borderColor: theme.semantic.border,
                        opacity: pressed || appleLoading || isLoading ? 0.7 : 1,
                      },
                    ]}
                  >
                    <Apple color={theme.colors.textPrimary} size={20} />
                    <Text style={[styles.ssoLabel, { color: theme.semantic.text }]}>
                      {appleLoading ? 'Signing in…' : 'Continue with Apple'}
                    </Text>
                  </Pressable>
                )}
              </View>
            </Animated.View>

            {/* Signup link */}
            <View style={styles.signUpContainer}>
              <Text style={[styles.signUpPrompt, { color: theme.semantic.textMuted }]}>
                Don't have an account?{' '}
              </Text>
              <Pressable onPress={() => navigation.navigate(ROUTES.Signup)}>
                <Text style={[styles.linkText, { color: theme.colors.accent }]}>
                  {t('login.signUp')}
                </Text>
              </Pressable>
            </View>

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1 
  },
  keyboardView: { 
    flex: 1 
  },
  content: { 
    flexGrow: 1,
    padding: tokens.spacing.xl,
    paddingTop: tokens.spacing.xxxl,
    paddingBottom: tokens.spacing.xxxl,
    gap: tokens.spacing.xl,
  },
  header: { 
    gap: tokens.spacing.sm,
    marginBottom: tokens.spacing.md,
  },
  title: { 
    fontSize: 32, 
    fontWeight: '700',
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  subtitle: { 
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  formContainer: {
    gap: tokens.spacing.md,
  },
  forgotLink: { 
    alignSelf: 'flex-end',
    paddingVertical: tokens.spacing.xxs,
  },
  linkText: { 
    fontSize: 15, 
    fontWeight: '600',
  },
  error: { 
    fontSize: 14,
    lineHeight: 20,
    marginTop: tokens.spacing.xxs,
  },
  primaryButton: {
    paddingVertical: tokens.spacing.lg,
    borderRadius: tokens.radii.md,
    alignItems: 'center',
    ...tokens.shadows.md,
  },
  primaryLabel: {
    color: tokens.colors.surface,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.md,
    marginVertical: tokens.spacing.xs,
  },
  line: { 
    flex: 1, 
    height: StyleSheet.hairlineWidth,
  },
  dividerText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  ssoGroup: { 
    gap: tokens.spacing.sm,
  },
  ssoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: tokens.radii.md,
    paddingVertical: tokens.spacing.md,
    gap: tokens.spacing.sm,
    backgroundColor: tokens.colors.surface,
  },
  ssoLabel: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: tokens.spacing.md,
  },
  signUpPrompt: {
    fontSize: 15,
    lineHeight: 20,
  },
});