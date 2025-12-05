import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ArrowLeft,
  Package,
  MapPin,
  Phone,
  MessageSquare,
  Navigation,
  Clock,
  CheckCircle,
  Truck,
} from 'lucide-react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { tokens } from '@/theme/tokens';
import { RootStackParamList } from '@/navigation/types';
import { useAppDispatch } from '@/store/hooks';
import { setActiveDelivery } from '@/store/slices/driverSlice';
import {
  useDeliveryDetailQuery,
  useUpdateDeliveryStatusMutation,
} from '@/hooks/driver/useDriverQueries';

type DeliveryDetailsRouteProp = RouteProp<RootStackParamList, 'DeliveryDetails'>;

export const DeliveryDetailsScreen: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<DeliveryDetailsRouteProp>();
  const { deliveryId } = route.params;

  const { data: delivery, isLoading } = useDeliveryDetailQuery(deliveryId);
  const updateStatusMutation = useUpdateDeliveryStatusMutation();

  const handleCall = useCallback((phone: string) => {
    Linking.openURL(`tel:${phone}`);
  }, []);

  const handleMessage = useCallback((phone: string) => {
    Linking.openURL(`sms:${phone}`);
  }, []);

  const handleNavigate = useCallback((address: string, lat?: number, lng?: number) => {
    const destination = lat && lng ? `${lat},${lng}` : encodeURIComponent(address);
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${destination}`);
  }, []);

  const handleStartDelivery = useCallback(() => {
    Alert.alert(
      'Start Delivery',
      'Mark this delivery as in transit?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          onPress: async () => {
            try {
              await updateStatusMutation.mutateAsync({
                deliveryId,
                status: 'in_transit',
              });
              dispatch(setActiveDelivery(deliveryId));
            } catch (error) {
              Alert.alert('Error', 'Failed to update status');
            }
          },
        },
      ]
    );
  }, [deliveryId, updateStatusMutation, dispatch]);

  const handleMarkDelivered = useCallback(() => {
    Alert.alert(
      'Complete Delivery',
      'Mark this package as delivered?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Delivery',
          onPress: async () => {
            try {
              await updateStatusMutation.mutateAsync({
                deliveryId,
                status: 'delivered',
              });
              dispatch(setActiveDelivery(undefined));
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to update status');
            }
          },
        },
      ]
    );
  }, [deliveryId, updateStatusMutation, dispatch, navigation]);

  if (isLoading || !delivery) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.semantic.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tokens.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const isAssigned = delivery.status === 'assigned';
  const isInTransit = delivery.status === 'in_transit';

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.semantic.background }]}
      edges={['top']}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.semantic.surface }]}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={8}
        >
          <ArrowLeft color={theme.semantic.text} size={24} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.semantic.text }]}>
          Delivery Details
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Tracking Info */}
        <View style={[styles.card, { backgroundColor: theme.semantic.surface }]}>
          <View style={styles.trackingHeader}>
            <Package color={tokens.colors.primary} size={20} />
            <Text style={[styles.trackingNumber, { color: theme.semantic.text }]}>
              {delivery.tracking_number}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  isInTransit
                    ? tokens.colors.warning + '20'
                    : isAssigned
                    ? tokens.colors.primary + '20'
                    : tokens.colors.success + '20',
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color:
                    isInTransit
                      ? tokens.colors.warning
                      : isAssigned
                      ? tokens.colors.primary
                      : tokens.colors.success,
                },
              ]}
            >
              {isInTransit ? 'In Transit' : isAssigned ? 'Assigned' : 'Delivered'}
            </Text>
          </View>
        </View>

        {/* Addresses */}
        <View style={[styles.card, { backgroundColor: theme.semantic.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.semantic.text }]}>
            Route
          </Text>

          {/* Pickup */}
          <View style={styles.addressBlock}>
            <View style={[styles.addressDot, { backgroundColor: tokens.colors.primary }]} />
            <View style={styles.addressContent}>
              <Text style={[styles.addressLabel, { color: theme.semantic.textMuted }]}>
                PICKUP
              </Text>
              <Text style={[styles.addressText, { color: theme.semantic.text }]}>
                {delivery.pickup_address}
              </Text>
              {delivery.sender_name && (
                <Text style={[styles.contactName, { color: theme.semantic.textMuted }]}>
                  {delivery.sender_name}
                </Text>
              )}
            </View>
            <Pressable
              style={[styles.navButton, { backgroundColor: tokens.colors.primary + '15' }]}
              onPress={() =>
                handleNavigate(
                  delivery.pickup_address,
                  Number(delivery.pickup_latitude),
                  Number(delivery.pickup_longitude)
                )
              }
            >
              <Navigation color={tokens.colors.primary} size={18} />
            </Pressable>
          </View>

          <View style={[styles.addressLine, { backgroundColor: theme.semantic.border }]} />

          {/* Delivery */}
          <View style={styles.addressBlock}>
            <View style={[styles.addressDot, { backgroundColor: tokens.colors.success }]} />
            <View style={styles.addressContent}>
              <Text style={[styles.addressLabel, { color: theme.semantic.textMuted }]}>
                DELIVERY
              </Text>
              <Text style={[styles.addressText, { color: theme.semantic.text }]}>
                {delivery.delivery_address}
              </Text>
              {delivery.receiver_name && (
                <Text style={[styles.contactName, { color: theme.semantic.textMuted }]}>
                  {delivery.receiver_name}
                </Text>
              )}
            </View>
            <Pressable
              style={[styles.navButton, { backgroundColor: tokens.colors.success + '15' }]}
              onPress={() =>
                handleNavigate(
                  delivery.delivery_address,
                  Number(delivery.delivery_latitude),
                  Number(delivery.delivery_longitude)
                )
              }
            >
              <Navigation color={tokens.colors.success} size={18} />
            </Pressable>
          </View>
        </View>

        {/* Customer Contact */}
        {delivery.customer_phone && (
          <View style={[styles.card, { backgroundColor: theme.semantic.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.semantic.text }]}>
              Customer
            </Text>
            <View style={styles.customerInfo}>
              <Text style={[styles.customerName, { color: theme.semantic.text }]}>
                {delivery.customer_name || 'Customer'}
              </Text>
              <View style={styles.contactButtons}>
                <Pressable
                  style={[styles.contactButton, { backgroundColor: tokens.colors.primary }]}
                  onPress={() => handleCall(delivery.customer_phone!)}
                >
                  <Phone color="#fff" size={18} />
                  <Text style={styles.contactButtonText}>Call</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.contactButton,
                    { backgroundColor: theme.semantic.surface, borderWidth: 1, borderColor: theme.semantic.border },
                  ]}
                  onPress={() => handleMessage(delivery.customer_phone!)}
                >
                  <MessageSquare color={theme.semantic.text} size={18} />
                  <Text style={[styles.contactButtonText, { color: theme.semantic.text }]}>
                    Message
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {/* Package Details */}
        {(delivery.package_weight || delivery.package_description) && (
          <View style={[styles.card, { backgroundColor: theme.semantic.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.semantic.text }]}>
              Package Info
            </Text>
            {delivery.package_weight && (
              <Text style={[styles.packageDetail, { color: theme.semantic.textMuted }]}>
                Weight: {delivery.package_weight} kg
              </Text>
            )}
            {delivery.package_description && (
              <Text style={[styles.packageDetail, { color: theme.semantic.textMuted }]}>
                {delivery.package_description}
              </Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* Action Button */}
      {(isAssigned || isInTransit) && (
        <View style={[styles.actionContainer, { backgroundColor: theme.semantic.surface }]}>
          {isAssigned ? (
            <Pressable
              style={[styles.actionButton, { backgroundColor: tokens.colors.primary }]}
              onPress={handleStartDelivery}
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Truck color="#fff" size={20} />
                  <Text style={styles.actionButtonText}>Start Delivery</Text>
                </>
              )}
            </Pressable>
          ) : (
            <Pressable
              style={[styles.actionButton, { backgroundColor: tokens.colors.success }]}
              onPress={handleMarkDelivered}
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? (
                <ActivityIndicator color="#fff" />
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...tokens.shadows.sm,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 32,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 120,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...tokens.shadows.sm,
  },
  trackingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  trackingNumber: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  addressBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    marginRight: 12,
  },
  addressLine: {
    width: 2,
    height: 24,
    marginLeft: 5,
    marginVertical: 8,
  },
  addressContent: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  addressText: {
    fontSize: 15,
    lineHeight: 22,
  },
  contactName: {
    fontSize: 13,
    marginTop: 4,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  customerInfo: {
    gap: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '500',
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  contactButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  packageDetail: {
    fontSize: 14,
    marginBottom: 4,
  },
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 34,
    ...tokens.shadows.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});
