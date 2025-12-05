import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ArrowLeft,
  Package,
  MapPin,
  User,
  Phone,
  Navigation,
  Play,
  CheckCircle,
  Clock,
} from 'lucide-react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { tokens } from '@/theme/tokens';
import { RootStackParamList } from '@/navigation/types';
import {
  useDriverDeliveriesQuery,
  useUpdateDeliveryStatusMutation,
} from '@/hooks/useDriverDeliveries';
import { ShipmentStatus } from '@/types/backend';

type Props = NativeStackScreenProps<RootStackParamList, 'DriverDeliveryDetails'>;

export const DriverDeliveryDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const theme = useTheme();
  const { deliveryId } = route.params;

  const { data: deliveries, isLoading } = useDriverDeliveriesQuery();
  const updateStatusMutation = useUpdateDeliveryStatusMutation();

  const delivery = deliveries?.find((d) => d.id === deliveryId);

  const handleCallCustomer = useCallback(() => {
    if (delivery?.customer_phone) {
      Linking.openURL(`tel:${delivery.customer_phone}`);
    }
  }, [delivery?.customer_phone]);

  const handleNavigate = useCallback(() => {
    if (delivery?.delivery_address) {
      const address = encodeURIComponent(delivery.delivery_address);
      Linking.openURL(`https://maps.google.com/?q=${address}`);
    }
  }, [delivery?.delivery_address]);

  const handleStartDelivery = useCallback(() => {
    Alert.alert(
      'Start Delivery',
      'Are you ready to start this delivery?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          onPress: () => {
            updateStatusMutation.mutate(
              { deliveryId, status: 'in_transit' },
              {
                onSuccess: () => {
                  Alert.alert('Success', 'Delivery started. Location tracking is now active.');
                },
                onError: (error) => {
                  Alert.alert('Error', 'Failed to start delivery. Please try again.');
                },
              }
            );
          },
        },
      ]
    );
  }, [deliveryId, updateStatusMutation]);

  const handleMarkDelivered = useCallback(() => {
    Alert.alert(
      'Complete Delivery',
      'Have you delivered this package to the customer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Delivery',
          onPress: () => {
            updateStatusMutation.mutate(
              { deliveryId, status: 'delivered' },
              {
                onSuccess: () => {
                  Alert.alert('Success', 'Delivery completed!', [
                    { text: 'OK', onPress: () => navigation.goBack() },
                  ]);
                },
                onError: () => {
                  Alert.alert('Error', 'Failed to complete delivery. Please try again.');
                },
              }
            );
          },
        },
      ]
    );
  }, [deliveryId, updateStatusMutation, navigation]);

  const getStatusColor = (status: ShipmentStatus) => {
    switch (status) {
      case 'in_transit':
        return tokens.colors.success;
      case 'assigned':
        return tokens.colors.packageOrange;
      case 'delivered':
        return theme.semantic.textMuted;
      default:
        return theme.semantic.textMuted;
    }
  };

  const getStatusLabel = (status: ShipmentStatus) => {
    switch (status) {
      case 'in_transit':
        return 'In Transit';
      case 'assigned':
        return 'Assigned';
      case 'delivered':
        return 'Delivered';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: tokens.colors.primaryBeige }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tokens.colors.packageOrange} />
        </View>
      </SafeAreaView>
    );
  }

  if (!delivery) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: tokens.colors.primaryBeige }]}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft color={theme.semantic.text} size={24} />
          </Pressable>
        </View>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.semantic.text }]}>
            Delivery not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const canStart = delivery.status === 'assigned';
  const canComplete = delivery.status === 'in_transit';
  const isDelivered = delivery.status === 'delivered';

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: tokens.colors.primaryBeige }]}
      edges={['top', 'left', 'right']}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft color={theme.semantic.text} size={24} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.semantic.text }]}>Delivery Details</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Status Card */}
        <View style={[styles.card, { backgroundColor: theme.semantic.surface }]}>
          <View style={styles.cardHeader}>
            <View style={styles.trackingRow}>
              <Package color={theme.semantic.text} size={20} />
              <Text style={[styles.trackingNumber, { color: theme.semantic.text }]}>
                {delivery.tracking_number}
              </Text>
            </View>
            <View
              style={[styles.statusBadge, { backgroundColor: getStatusColor(delivery.status) + '20' }]}
            >
              <Text style={[styles.statusText, { color: getStatusColor(delivery.status) }]}>
                {getStatusLabel(delivery.status)}
              </Text>
            </View>
          </View>
        </View>

        {/* Customer Info */}
        <View style={[styles.card, { backgroundColor: theme.semantic.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.semantic.text }]}>Customer</Text>

          <View style={styles.infoRow}>
            <User color={theme.semantic.textMuted} size={18} />
            <Text style={[styles.infoText, { color: theme.semantic.text }]}>
              {delivery.customer_name}
            </Text>
          </View>

          {delivery.customer_phone && (
            <Pressable style={styles.infoRow} onPress={handleCallCustomer}>
              <Phone color={tokens.colors.success} size={18} />
              <Text style={[styles.infoText, styles.linkText, { color: tokens.colors.success }]}>
                {delivery.customer_phone}
              </Text>
            </Pressable>
          )}
        </View>

        {/* Addresses */}
        <View style={[styles.card, { backgroundColor: theme.semantic.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.semantic.text }]}>Addresses</Text>

          <View style={styles.addressBlock}>
            <View style={styles.addressHeader}>
              <View style={[styles.addressDot, { backgroundColor: tokens.colors.success }]} />
              <Text style={[styles.addressLabel, { color: theme.semantic.textMuted }]}>Pickup</Text>
            </View>
            <Text style={[styles.addressText, { color: theme.semantic.text }]}>
              {delivery.pickup_address}
            </Text>
          </View>

          <View style={styles.addressDivider} />

          <View style={styles.addressBlock}>
            <View style={styles.addressHeader}>
              <View style={[styles.addressDot, { backgroundColor: tokens.colors.error }]} />
              <Text style={[styles.addressLabel, { color: theme.semantic.textMuted }]}>Delivery</Text>
            </View>
            <Text style={[styles.addressText, { color: theme.semantic.text }]}>
              {delivery.delivery_address}
            </Text>
          </View>

          <Pressable
            style={[styles.navigateButton, { backgroundColor: tokens.colors.packageOrange + '15' }]}
            onPress={handleNavigate}
          >
            <Navigation color={tokens.colors.packageOrange} size={18} />
            <Text style={[styles.navigateText, { color: tokens.colors.packageOrange }]}>
              Open in Maps
            </Text>
          </Pressable>
        </View>

        {/* Order Info */}
        <View style={[styles.card, { backgroundColor: theme.semantic.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.semantic.text }]}>Order Details</Text>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.semantic.textMuted }]}>Order ID</Text>
            <Text style={[styles.detailValue, { color: theme.semantic.text }]}>
              #{delivery.order_id}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.semantic.textMuted }]}>Amount</Text>
            <Text style={[styles.detailValue, { color: theme.semantic.text }]}>
              ${delivery.total_amount}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.semantic.textMuted }]}>Created</Text>
            <Text style={[styles.detailValue, { color: theme.semantic.text }]}>
              {new Date(delivery.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      {!isDelivered && (
        <View style={[styles.actionBar, { backgroundColor: theme.semantic.surface }]}>
          {canStart && (
            <Pressable
              style={[styles.actionButton, { backgroundColor: tokens.colors.packageOrange }]}
              onPress={handleStartDelivery}
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Play color="#fff" size={20} fill="#fff" />
                  <Text style={styles.actionButtonText}>Start Delivery</Text>
                </>
              )}
            </Pressable>
          )}

          {canComplete && (
            <Pressable
              style={[styles.actionButton, { backgroundColor: tokens.colors.success }]}
              onPress={handleMarkDelivered}
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <CheckCircle color="#fff" size={20} />
                  <Text style={styles.actionButtonText}>Mark as Delivered</Text>
                </>
              )}
            </Pressable>
          )}
        </View>
      )}

      {/* Delivered State */}
      {isDelivered && (
        <View style={[styles.deliveredBar, { backgroundColor: tokens.colors.success + '15' }]}>
          <CheckCircle color={tokens.colors.success} size={24} />
          <Text style={[styles.deliveredText, { color: tokens.colors.success }]}>
            Delivery Completed
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 16,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    gap: 12,
    ...tokens.shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trackingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trackingNumber: {
    fontSize: 18,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    fontSize: 16,
  },
  linkText: {
    textDecorationLine: 'underline',
  },
  addressBlock: {
    gap: 6,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  addressLabel: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addressText: {
    fontSize: 15,
    marginLeft: 18,
    lineHeight: 22,
  },
  addressDivider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 8,
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  navigateText: {
    fontSize: 15,
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  actionBar: {
    padding: 16,
    paddingBottom: 32,
    ...tokens.shadows.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  deliveredBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 20,
    paddingBottom: 36,
  },
  deliveredText: {
    fontSize: 17,
    fontWeight: '600',
  },
});
