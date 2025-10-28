import React, { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, ChevronDown } from 'lucide-react-native';

import { RootStackParamList } from '@/navigation/types';
import { FormTextInput } from '@/components/FormTextInput';
import { useTheme } from '@/theme/ThemeProvider';
import { useAddTracking } from '@/hooks/useAddTracking';
import { t } from '@/i18n/i18n';

const carrierOptions = ['UPS', 'FedEx', 'DHL', 'CanadaPost', 'Other'] as const;

const schema = z.object({
  trackingNo: z.string().min(6, 'Enter a valid tracking number'),
  nickname: z.string().max(40).optional(),
  carrier: z.enum(carrierOptions),
});

type FormValues = z.infer<typeof schema>;

type AddTrackingProps = NativeStackScreenProps<RootStackParamList, 'AddTracking'>;

export const AddTrackingSheetScreen: React.FC<AddTrackingProps> = ({ navigation }) => {
  const theme = useTheme();
  const mutation = useAddTracking();
  const [carrierPickerVisible, setCarrierPickerVisible] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      trackingNo: '',
      nickname: '',
      carrier: 'UPS',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    await mutation.mutateAsync(values);
    navigation.goBack();
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.semantic.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={styles.flex}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.semantic.text }]}>{t('addTracking.title')}</Text>
          <Pressable onPress={() => navigation.goBack()} accessibilityRole="button">
            <X color={theme.semantic.text} size={22} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Controller
            name="trackingNo"
            control={control}
            render={({ field: { value, onChange, onBlur } }) => (
              <FormTextInput
                label={t('addTracking.trackingPlaceholder')}
                autoCapitalize="characters"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                errorMessage={errors.trackingNo?.message}
              />
            )}
          />
          <Controller
            name="nickname"
            control={control}
            render={({ field: { value, onChange, onBlur } }) => (
              <FormTextInput
                label={t('addTracking.nicknamePlaceholder')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                helperText="Optional label to identify this shipment"
                errorMessage={errors.nickname?.message}
              />
            )}
          />
          <Controller
            name="carrier"
            control={control}
            render={({ field: { value, onChange } }) => (
              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: theme.semantic.text }]}>{t('addTracking.carrierLabel')}</Text>
                <Pressable
                  onPress={() => setCarrierPickerVisible(true)}
                  style={({ pressed }) => [
                    styles.select,
                    {
                      borderColor: theme.semantic.border,
                      backgroundColor: theme.semantic.surface,
                      opacity: pressed ? 0.9 : 1,
                    },
                  ]}
                >
                  <Text style={{ color: theme.semantic.text }}>{value}</Text>
                  <ChevronDown color={theme.semantic.textMuted} size={18} />
                </Pressable>
                {errors.carrier ? (
                  <Text style={[styles.error, { color: theme.colors.error }]}>{errors.carrier.message}</Text>
                ) : null}
                <Modal
                  visible={carrierPickerVisible}
                  transparent
                  animationType="fade"
                  onRequestClose={() => setCarrierPickerVisible(false)}
                >
                  <Pressable style={styles.modalOverlay} onPress={() => setCarrierPickerVisible(false)}>
                    <View />
                  </Pressable>
                  <View style={[styles.modalContent, { backgroundColor: theme.semantic.surface }]}>
                    {carrierOptions.map((carrier) => (
                      <Pressable
                        key={carrier}
                        onPress={() => {
                          onChange(carrier);
                          setCarrierPickerVisible(false);
                        }}
                        style={styles.modalItem}
                      >
                        <Text style={{ color: theme.semantic.text }}>{carrier}</Text>
                      </Pressable>
                    ))}
                  </View>
                </Modal>
              </View>
            )}
          />
        </ScrollView>
        <View style={styles.footer}>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.goBack()}
            style={styles.secondaryButton}
          >
            <Text style={[styles.secondaryLabel, { color: theme.colors.accent }]}>{t('addTracking.cancel')}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={onSubmit}
            disabled={mutation.isPending}
            style={({ pressed }) => [
              styles.primaryButton,
              {
                backgroundColor: theme.colors.primaryTeal,
                opacity: pressed || mutation.isPending ? 0.8 : 1,
              },
            ]}
          >
            <Text style={styles.primaryLabel}>
              {mutation.isPending ? 'Adding…' : t('addTracking.submit')}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  error: {
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  modalContent: {
    margin: 24,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  modalItem: {
    paddingVertical: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  secondaryLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButton: {
    flex: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  primaryLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
