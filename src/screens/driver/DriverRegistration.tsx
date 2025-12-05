import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Truck, FileText, User, ChevronDown } from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';

import { useTheme } from '@/theme/ThemeProvider';
import { tokens } from '@/theme/tokens';
import { RootStackParamList } from '@/navigation/types';
import { useDriverRegistrationMutation } from '@/hooks/driver/useDriverQueries';

const VEHICLE_TYPES = ['Car', 'SUV', 'Van', 'Truck', 'Motorcycle', 'Bicycle'];

export const DriverRegistrationScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const queryClient = useQueryClient();
  const registrationMutation = useDriverRegistrationMutation();

  const [name, setName] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [showVehiclePicker, setShowVehiclePicker] = useState(false);

  const isFormValid = name.trim().length >= 2 && vehicleType && licenseNumber.trim().length >= 5;

  const handleRegister = async () => {
    if (!isFormValid) return;

    try {
      await registrationMutation.mutateAsync({
        name: name.trim(),
        vehicleType,
        licenseNumber: licenseNumber.trim(),
      });

      // Invalidate user profile to refresh role
      await queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });

      Alert.alert(
        'Registration Successful',
        'You are now registered as a driver. The app will refresh with your driver dashboard.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to main which will show driver tabs due to role change
              navigation.reset({
                index: 0,
                routes: [{ name: 'Main' }],
              });
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Registration Failed',
        error?.message || 'Failed to register as driver. Please try again.'
      );
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.semantic.background }]}
      edges={['top']}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: `${tokens.colors.primary}15` }]}>
              <Truck color={tokens.colors.primary} size={32} />
            </View>
            <Text style={[styles.title, { color: theme.semantic.text }]}>
              Become a Driver
            </Text>
            <Text style={[styles.subtitle, { color: theme.semantic.textMuted }]}>
              Register to start delivering packages and earn money
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.semantic.text }]}>Full Name</Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: theme.semantic.surface,
                    borderColor: theme.semantic.border,
                  },
                ]}
              >
                <User color={theme.semantic.textMuted} size={20} />
                <TextInput
                  style={[styles.input, { color: theme.semantic.text }]}
                  placeholder="Enter your full name"
                  placeholderTextColor={theme.semantic.textMuted}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Vehicle Type Picker */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.semantic.text }]}>Vehicle Type</Text>
              <Pressable
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: theme.semantic.surface,
                    borderColor: theme.semantic.border,
                  },
                ]}
                onPress={() => setShowVehiclePicker(!showVehiclePicker)}
              >
                <Truck color={theme.semantic.textMuted} size={20} />
                <Text
                  style={[
                    styles.pickerText,
                    { color: vehicleType ? theme.semantic.text : theme.semantic.textMuted },
                  ]}
                >
                  {vehicleType || 'Select vehicle type'}
                </Text>
                <ChevronDown color={theme.semantic.textMuted} size={20} />
              </Pressable>
              {showVehiclePicker && (
                <View
                  style={[
                    styles.pickerOptions,
                    {
                      backgroundColor: theme.semantic.surface,
                      borderColor: theme.semantic.border,
                    },
                  ]}
                >
                  {VEHICLE_TYPES.map((type) => (
                    <Pressable
                      key={type}
                      style={[
                        styles.pickerOption,
                        vehicleType === type && {
                          backgroundColor: `${tokens.colors.primary}15`,
                        },
                      ]}
                      onPress={() => {
                        setVehicleType(type);
                        setShowVehiclePicker(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.pickerOptionText,
                          {
                            color:
                              vehicleType === type
                                ? tokens.colors.primary
                                : theme.semantic.text,
                          },
                        ]}
                      >
                        {type}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            {/* License Number Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.semantic.text }]}>License Number</Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: theme.semantic.surface,
                    borderColor: theme.semantic.border,
                  },
                ]}
              >
                <FileText color={theme.semantic.textMuted} size={20} />
                <TextInput
                  style={[styles.input, { color: theme.semantic.text }]}
                  placeholder="Enter license plate number"
                  placeholderTextColor={theme.semantic.textMuted}
                  value={licenseNumber}
                  onChangeText={setLicenseNumber}
                  autoCapitalize="characters"
                />
              </View>
            </View>
          </View>

          {/* Register Button */}
          <View style={styles.footer}>
            <Pressable
              style={[
                styles.registerButton,
                {
                  backgroundColor: isFormValid ? tokens.colors.primary : theme.semantic.border,
                },
              ]}
              onPress={handleRegister}
              disabled={!isFormValid || registrationMutation.isPending}
            >
              <Text style={styles.registerButtonText}>
                {registrationMutation.isPending ? 'Registering...' : 'Register as Driver'}
              </Text>
            </Pressable>
            <Pressable style={styles.cancelButton} onPress={() => navigation.goBack()}>
              <Text style={[styles.cancelButtonText, { color: theme.semantic.textMuted }]}>
                Cancel
              </Text>
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
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  pickerText: {
    flex: 1,
    fontSize: 16,
  },
  pickerOptions: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  pickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  pickerOptionText: {
    fontSize: 16,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 24,
    gap: 12,
  },
  registerButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
  },
});
