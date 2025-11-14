import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Package, MapPin, User, Phone, Mail } from 'lucide-react-native';

import { FormTextInput } from '@/components/FormTextInput';
import { useTheme } from '@/theme/ThemeProvider';
import { tokens } from '@/theme/tokens';
import { RootStackParamList } from '@/navigation/types';

export const PlaceOrderScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Form state
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [senderAddress, setSenderAddress] = useState('');
  const [senderCity, setSenderCity] = useState('');
  const [senderPostal, setSenderPostal] = useState('');

  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [receiverAddress, setReceiverAddress] = useState('');
  const [receiverCity, setReceiverCity] = useState('');
  const [receiverPostal, setReceiverPostal] = useState('');

  const [packageWeight, setPackageWeight] = useState('');
  const [packageDescription, setPackageDescription] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Sender validation
    if (!senderName.trim()) newErrors.senderName = 'Sender name is required';
    if (!senderPhone.trim()) newErrors.senderPhone = 'Sender phone is required';
    if (!senderAddress.trim()) newErrors.senderAddress = 'Sender address is required';
    if (!senderCity.trim()) newErrors.senderCity = 'City is required';
    if (!senderPostal.trim()) newErrors.senderPostal = 'Postal code is required';

    // Receiver validation
    if (!receiverName.trim()) newErrors.receiverName = 'Receiver name is required';
    if (!receiverPhone.trim()) newErrors.receiverPhone = 'Receiver phone is required';
    if (!receiverAddress.trim()) newErrors.receiverAddress = 'Receiver address is required';
    if (!receiverCity.trim()) newErrors.receiverCity = 'City is required';
    if (!receiverPostal.trim()) newErrors.receiverPostal = 'Postal code is required';

    // Package validation
    if (!packageWeight.trim()) newErrors.packageWeight = 'Weight is required';
    if (!packageDescription.trim()) newErrors.packageDescription = 'Description is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // TODO: Submit order to your API
    const orderData = {
      sender: {
        name: senderName,
        phone: senderPhone,
        address: senderAddress,
        city: senderCity,
        postalCode: senderPostal,
      },
      receiver: {
        name: receiverName,
        phone: receiverPhone,
        address: receiverAddress,
        city: receiverCity,
        postalCode: receiverPostal,
      },
      package: {
        weight: packageWeight,
        description: packageDescription,
      },
    };

    console.log('Order Data:', orderData);

    Alert.alert(
      'Success',
      'Your order has been placed successfully!',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <SafeAreaView 
      style={[styles.safeArea, { backgroundColor: theme.semantic.background || tokens.colors.background }]}
      edges={['top', 'left', 'right']}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.semantic.surface || tokens.colors.surface }]}>
        <Pressable 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
          accessibilityRole="button"
        >
          <ArrowLeft 
            color={theme.semantic.text || tokens.colors.textPrimary} 
            size={24}
            strokeWidth={2}
          />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.semantic.text || tokens.colors.textPrimary }]}>
          Place Order
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Sender Section */}
        <View style={[styles.section, { backgroundColor: theme.semantic.surface || tokens.colors.surface }]}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color={theme.semantic.text || tokens.colors.textPrimary} strokeWidth={2} />
            <Text style={[styles.sectionTitle, { color: theme.semantic.text || tokens.colors.textPrimary }]}>
              Sender Information
            </Text>
          </View>

          <FormTextInput
            label="Full Name"
            placeholder="John Doe"
            value={senderName}
            onChangeText={setSenderName}
            errorMessage={errors.senderName}
            leftAccessory={<User size={18} color={theme.semantic.textMuted || tokens.colors.textSecondary} />}
          />

          <FormTextInput
            label="Phone Number"
            placeholder="+1 (555) 000-0000"
            value={senderPhone}
            onChangeText={setSenderPhone}
            keyboardType="phone-pad"
            errorMessage={errors.senderPhone}
            leftAccessory={<Phone size={18} color={theme.semantic.textMuted || tokens.colors.textSecondary} />}
          />

          <FormTextInput
            label="Address"
            placeholder="123 Main Street"
            value={senderAddress}
            onChangeText={setSenderAddress}
            errorMessage={errors.senderAddress}
          />

          <View style={styles.row}>
            <FormTextInput
              label="City"
              placeholder="Toronto"
              value={senderCity}
              onChangeText={setSenderCity}
              errorMessage={errors.senderCity}
              containerStyle={styles.halfInput}
            />
            <FormTextInput
              label="Postal Code"
              placeholder="M5V 3A8"
              value={senderPostal}
              onChangeText={setSenderPostal}
              errorMessage={errors.senderPostal}
              containerStyle={styles.halfInput}
            />
          </View>
        </View>

        {/* Receiver Section */}
        <View style={[styles.section, { backgroundColor: theme.semantic.surface || tokens.colors.surface }]}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color={theme.semantic.text || tokens.colors.textPrimary} strokeWidth={2} />
            <Text style={[styles.sectionTitle, { color: theme.semantic.text || tokens.colors.textPrimary }]}>
              Receiver Information
            </Text>
          </View>

          <FormTextInput
            label="Full Name"
            placeholder="Jane Smith"
            value={receiverName}
            onChangeText={setReceiverName}
            errorMessage={errors.receiverName}
            leftAccessory={<User size={18} color={theme.semantic.textMuted || tokens.colors.textSecondary} />}
          />

          <FormTextInput
            label="Phone Number"
            placeholder="+1 (555) 000-0000"
            value={receiverPhone}
            onChangeText={setReceiverPhone}
            keyboardType="phone-pad"
            errorMessage={errors.receiverPhone}
            leftAccessory={<Phone size={18} color={theme.semantic.textMuted || tokens.colors.textSecondary} />}
          />

          <FormTextInput
            label="Address"
            placeholder="456 Oak Avenue"
            value={receiverAddress}
            onChangeText={setReceiverAddress}
            errorMessage={errors.receiverAddress}
          />

          <View style={styles.row}>
            <FormTextInput
              label="City"
              placeholder="Vancouver"
              value={receiverCity}
              onChangeText={setReceiverCity}
              errorMessage={errors.receiverCity}
              containerStyle={styles.halfInput}
            />
            <FormTextInput
              label="Postal Code"
              placeholder="V6B 2W9"
              value={receiverPostal}
              onChangeText={setReceiverPostal}
              errorMessage={errors.receiverPostal}
              containerStyle={styles.halfInput}
            />
          </View>
        </View>

        {/* Package Section */}
        <View style={[styles.section, { backgroundColor: theme.semantic.surface || tokens.colors.surface }]}>
          <View style={styles.sectionHeader}>
            <Package size={20} color={theme.semantic.text || tokens.colors.textPrimary} strokeWidth={2} />
            <Text style={[styles.sectionTitle, { color: theme.semantic.text || tokens.colors.textPrimary }]}>
              Package Details
            </Text>
          </View>

          <FormTextInput
            label="Weight (kg)"
            placeholder="2.5"
            value={packageWeight}
            onChangeText={setPackageWeight}
            keyboardType="decimal-pad"
            errorMessage={errors.packageWeight}
          />

          <FormTextInput
            label="Description"
            placeholder="Books, Electronics, Clothing, etc."
            value={packageDescription}
            onChangeText={setPackageDescription}
            errorMessage={errors.packageDescription}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Submit Button */}
        <Pressable
          style={({ pressed }) => [
            styles.submitButton,
            { 
              backgroundColor: theme.semantic.text || tokens.colors.textPrimary,
              opacity: pressed ? 0.9 : 1,
            },
          ]}
          onPress={handlePlaceOrder}
        >
          <Text style={styles.submitButtonText}>Place Order</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
    ...tokens.shadows.sm,
  },
  backButton: {
    padding: tokens.spacing.xs,
    marginLeft: -tokens.spacing.xs,
  },
  headerTitle: {
    ...tokens.typography.h3,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: tokens.spacing.lg,
    gap: tokens.spacing.lg,
    paddingBottom: tokens.spacing.xxxl,
  },
  section: {
    padding: tokens.spacing.lg,
    borderRadius: tokens.radii.card,
    gap: tokens.spacing.md,
    ...tokens.shadows.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.xs,
    marginBottom: tokens.spacing.xs,
  },
  sectionTitle: {
    ...tokens.typography.h4,
  },
  row: {
    flexDirection: 'row',
    gap: tokens.spacing.sm,
  },
  halfInput: {
    flex: 1,
  },
  submitButton: {
    padding: tokens.spacing.lg,
    borderRadius: tokens.radii.md,
    alignItems: 'center',
    marginTop: tokens.spacing.md,
    ...tokens.shadows.md,
  },
  submitButtonText: {
    color: tokens.colors.surface,
    ...tokens.typography.h4,
  },
});