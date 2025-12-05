import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, User, ArrowLeft, Apple, Car, FileText, ChevronDown } from 'lucide-react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { ROUTES } from '@/constants/routes';
import { RootStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme/ThemeProvider';
import { FormTextInput } from '@/components/FormTextInput';
import { useAuth } from '@/stores/useAuth';
import { tokens } from '@/theme/tokens';
import { driverService } from '@/api/driverService';

const VEHICLE_TYPES = ['Car', 'Van', 'Truck', 'Motorcycle', 'Bicycle'] as const;

const schema = z
  .object({
    displayName: z.string().min(2, 'Name must be at least 2 characters.'),
    email: z.string().email('Enter a valid email address.').min(1, 'Email is required.'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters.')
      .min(1, 'Password is required.'),
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
    accountType: z.enum(['customer', 'driver']).default('customer'),
    vehicleType: z.string().optional(),
    licenseNumber: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })
  .refine(
    (data) => {
      if (data.accountType === 'driver') {
        return !!data.vehicleType && data.vehicleType.length > 0;
      }
      return true;
    },
    {
      message: 'Vehicle type is required for drivers.',
      path: ['vehicleType'],
    }
  )
  .refine(
    (data) => {
      if (data.accountType === 'driver') {
        return !!data.licenseNumber && data.licenseNumber.length >= 5;
      }
      return true;
    },
    {
      message: 'License number is required for drivers (min 5 characters).',
      path: ['licenseNumber'],
    }
  );

type FormValues = z.infer<typeof schema>;

type SignupProps = NativeStackScreenProps<RootStackParamList, 'Signup'>;

export const SignupScreen: React.FC<SignupProps> = ({ navigation }) => {
  const theme = useTheme();
  const signUp = useAuth((state) => state.signUp);
  const signInWithApple = useAuth((state) => state.signInWithApple);
  const status = useAuth((state) => state.status);
  const error = useAuth((state) => state.error);

  const [isAppleAvailable, setIsAppleAvailable] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [showVehiclePicker, setShowVehiclePicker] = useState(false);
  const [driverRegistrationError, setDriverRegistrationError] = useState<string | null>(null);

  // Check if Apple Sign-In is available
  React.useEffect(() => {
    const checkAppleAvailability = async () => {
      const available = await AppleAuthentication.isAvailableAsync();
      setIsAppleAvailable(available);
    };
    checkAppleAvailability();
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
      confirmPassword: '',
      accountType: 'customer',
      vehicleType: '',
      licenseNumber: '',
    },
  });

  const accountType = useWatch({ control, name: 'accountType' });
  const vehicleType = useWatch({ control, name: 'vehicleType' });
  const isDriver = accountType === 'driver';

  const isLoading = status === 'loading';

  const onSubmit = handleSubmit(async (values) => {
    try {
      setDriverRegistrationError(null);

      // First create the Firebase account
      await signUp({
        email: values.email,
        password: values.password,
        displayName: values.displayName,
      });

      // If driver, register as driver after account creation
      if (values.accountType === 'driver' && values.vehicleType && values.licenseNumber) {
        try {
          await driverService.registerAsDriver({
            name: values.displayName,
            vehicleType: values.vehicleType,
            licenseNumber: values.licenseNumber,
          });
        } catch (driverErr) {
          console.error('Driver registration error:', driverErr);
          setDriverRegistrationError('Account created but driver registration failed. Please try again from settings.');
        }
      }

      // Navigation will happen automatically via auth state listener
      if (useAuth.getState().status === 'authenticated') {
        navigation.replace(ROUTES.Main);
      }
    } catch (err) {
      // Error is already set in the auth store
      console.error('Sign up error:', err);
    }
  });

  const handleAppleSignIn = async () => {
    setAppleLoading(true);
    try {
      await signInWithApple();
      // Navigation will happen automatically via auth state listener
      if (useAuth.getState().status === 'authenticated') {
        navigation.replace(ROUTES.Main);
      }
    } catch (err) {
      // Error is already set in the auth store
      console.error('Apple sign in error:', err);
    } finally {
      setAppleLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: tokens.colors.primaryBeige }]}
      edges={['top', 'left', 'right']}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Back Button */}
          <Pressable
            accessibilityRole="button"
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft color={theme.semantic.text} size={24} />
          </Pressable>

          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.semantic.text }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: theme.semantic.textMuted }]}>
              {isDriver ? 'Sign up to start delivering packages' : 'Sign up to start tracking your shipments'}
            </Text>
          </View>

          {/* Account Type Toggle */}
          <View style={styles.accountTypeContainer}>
            <Controller
              name="accountType"
              control={control}
              render={({ field: { value, onChange } }) => (
                <View style={[styles.toggleContainer, { backgroundColor: theme.semantic.surface }]}>
                  <Pressable
                    style={[
                      styles.toggleOption,
                      value === 'customer' && {
                        backgroundColor: tokens.colors.packageOrange,
                      },
                    ]}
                    onPress={() => onChange('customer')}
                  >
                    <Text
                      style={[
                        styles.toggleText,
                        { color: value === 'customer' ? '#fff' : theme.semantic.textMuted },
                      ]}
                    >
                      Customer
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.toggleOption,
                      value === 'driver' && {
                        backgroundColor: tokens.colors.packageOrange,
                      },
                    ]}
                    onPress={() => onChange('driver')}
                  >
                    <Text
                      style={[
                        styles.toggleText,
                        { color: value === 'driver' ? '#fff' : theme.semantic.textMuted },
                      ]}
                    >
                      Driver
                    </Text>
                  </Pressable>
                </View>
              )}
            />
          </View>

          <View style={styles.form}>
            <Controller
              name="displayName"
              control={control}
              render={({ field: { value, onChange, onBlur } }) => (
                <FormTextInput
                  label="Full Name"
                  autoCapitalize="words"
                  autoCorrect={false}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  errorMessage={errors.displayName?.message}
                  leftAccessory={<User color={theme.semantic.textMuted} size={18} />}
                />
              )}
            />

            <Controller
              name="email"
              control={control}
              defaultValue=""
              render={({ field: { value, onChange, onBlur } }) => (
                <FormTextInput
                  label="Email"
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

            <Controller
              name="password"
              control={control}
              defaultValue=""
              render={({ field: { value, onChange, onBlur } }) => (
                <FormTextInput
                  label="Password"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  errorMessage={errors.password?.message}
                  leftAccessory={<Lock color={theme.semantic.textMuted} size={18} />}
                />
              )}
            />

            <Controller
              name="confirmPassword"
              control={control}
              render={({ field: { value, onChange, onBlur } }) => (
                <FormTextInput
                  label="Confirm Password"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  errorMessage={errors.confirmPassword?.message}
                  leftAccessory={<Lock color={theme.semantic.textMuted} size={18} />}
                />
              )}
            />

            {/* Driver-specific fields */}
            {isDriver && (
              <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={styles.driverFields}>
                {/* Vehicle Type Picker */}
                <View>
                  <Text style={[styles.fieldLabel, { color: theme.semantic.text }]}>Vehicle Type</Text>
                  <Pressable
                    style={[
                      styles.pickerButton,
                      { backgroundColor: theme.semantic.surface, borderColor: errors.vehicleType ? theme.colors.error : theme.semantic.border },
                    ]}
                    onPress={() => setShowVehiclePicker(!showVehiclePicker)}
                  >
                    <Car color={theme.semantic.textMuted} size={18} />
                    <Text style={[styles.pickerText, { color: vehicleType ? theme.semantic.text : theme.semantic.textMuted }]}>
                      {vehicleType || 'Select vehicle type'}
                    </Text>
                    <ChevronDown color={theme.semantic.textMuted} size={18} />
                  </Pressable>
                  {errors.vehicleType && (
                    <Text style={[styles.fieldError, { color: theme.colors.error }]}>
                      {errors.vehicleType.message}
                    </Text>
                  )}

                  {showVehiclePicker && (
                    <View style={[styles.pickerOptions, { backgroundColor: theme.semantic.surface }]}>
                      {VEHICLE_TYPES.map((type) => (
                        <Pressable
                          key={type}
                          style={[
                            styles.pickerOption,
                            vehicleType === type && { backgroundColor: tokens.colors.packageOrange + '20' },
                          ]}
                          onPress={() => {
                            setValue('vehicleType', type);
                            setShowVehiclePicker(false);
                          }}
                        >
                          <Text style={[styles.pickerOptionText, { color: theme.semantic.text }]}>{type}</Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>

                {/* License Number */}
                <Controller
                  name="licenseNumber"
                  control={control}
                  render={({ field: { value, onChange, onBlur } }) => (
                    <FormTextInput
                      label="Driver's License Number"
                      autoCapitalize="characters"
                      autoCorrect={false}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      errorMessage={errors.licenseNumber?.message}
                      leftAccessory={<FileText color={theme.semantic.textMuted} size={18} />}
                    />
                  )}
                />
              </Animated.View>
            )}

            {error ? <Text style={[styles.error, { color: theme.colors.error }]}>{error}</Text> : null}
            {driverRegistrationError ? <Text style={[styles.error, { color: theme.colors.error }]}>{driverRegistrationError}</Text> : null}

            <Pressable
              accessibilityRole="button"
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
              <Text style={styles.primaryLabel}>{isLoading ? 'Creating account…' : 'Sign Up'}</Text>
            </Pressable>

            <Text style={[styles.termsText, { color: theme.semantic.textMuted }]}>
              By signing up, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>

          {/* Apple Sign-In Option */}
          {isAppleAvailable && (
            <>
              <View style={styles.divider}>
                <View style={[styles.line, { backgroundColor: theme.semantic.border }]} />
                <Text style={[styles.dividerText, { color: theme.semantic.textMuted }]}>or</Text>
                <View style={[styles.line, { backgroundColor: theme.semantic.border }]} />
              </View>

              <Pressable
                accessibilityRole="button"
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
                  {appleLoading ? 'Signing up…' : 'Sign up with Apple'}
                </Text>
              </Pressable>
            </>
          )}

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.semantic.textMuted }]}>
              Already have an account?{' '}
            </Text>
            <Pressable accessibilityRole="button" onPress={() => navigation.navigate(ROUTES.Login)}>
              <Text style={[styles.linkText, { color: theme.colors.accent }]}>Sign In</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    padding: 24,
    gap: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  header: {
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    gap: 16,
  },
  error: {
    fontSize: 14,
  },
  primaryButton: {
    marginTop: 8,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  primaryLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  termsText: {
    fontSize: 8,
    textAlign: 'center',
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  dividerText: {
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  ssoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    gap: 12,
  },
  ssoLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  accountTypeContainer: {
    marginBottom: 8,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '600',
  },
  driverFields: {
    gap: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  pickerText: {
    flex: 1,
    fontSize: 16,
  },
  fieldError: {
    fontSize: 12,
    marginTop: 4,
  },
  pickerOptions: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
    ...tokens.shadows.md,
  },
  pickerOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  pickerOptionText: {
    fontSize: 16,
  },
});
