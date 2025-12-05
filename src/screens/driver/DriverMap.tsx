import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Linking,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Navigation, Package, MapPin, Phone } from 'lucide-react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { tokens } from '@/theme/tokens';
import { useAppSelector } from '@/store/hooks';
import { useDriverDeliveriesQuery } from '@/hooks/driver/useDriverQueries';
import type { DeliveryItem } from '@/types/backend';

const INITIAL_REGION = {
  latitude: 43.6532,
  longitude: -79.3832,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

export const DriverMapScreen: React.FC = () => {
  const theme = useTheme();
  const mapRef = useRef<MapView>(null);
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryItem | null>(null);

  const currentLocation = useAppSelector((state) => state.driver.currentLocation);
  const activeDeliveryId = useAppSelector((state) => state.driver.activeDeliveryId);

  const { data: deliveriesData, isLoading } = useDriverDeliveriesQuery();

  const activeDeliveries = deliveriesData?.deliveries?.filter(
    (d) => d.status === 'assigned' || d.status === 'in_transit'
  ) || [];

  // Select active delivery by default
  useEffect(() => {
    if (activeDeliveryId && activeDeliveries.length > 0) {
      const active = activeDeliveries.find((d) => d.id === activeDeliveryId);
      if (active) {
        setSelectedDelivery(active);
      }
    } else if (activeDeliveries.length > 0 && !selectedDelivery) {
      setSelectedDelivery(activeDeliveries[0]);
    }
  }, [activeDeliveryId, activeDeliveries, selectedDelivery]);

  // Fit map to show all markers
  useEffect(() => {
    if (mapRef.current && activeDeliveries.length > 0) {
      const coordinates: { latitude: number; longitude: number }[] = [];

      if (currentLocation) {
        coordinates.push(currentLocation);
      }

      activeDeliveries.forEach((delivery) => {
        if (delivery.pickup_latitude && delivery.pickup_longitude) {
          coordinates.push({
            latitude: Number(delivery.pickup_latitude),
            longitude: Number(delivery.pickup_longitude),
          });
        }
        if (delivery.delivery_latitude && delivery.delivery_longitude) {
          coordinates.push({
            latitude: Number(delivery.delivery_latitude),
            longitude: Number(delivery.delivery_longitude),
          });
        }
      });

      if (coordinates.length > 0) {
        mapRef.current.fitToCoordinates(coordinates, {
          edgePadding: { top: 100, right: 50, bottom: 200, left: 50 },
          animated: true,
        });
      }
    }
  }, [activeDeliveries, currentLocation]);

  const handleNavigate = useCallback((address: string, lat?: number, lng?: number) => {
    const destination = lat && lng ? `${lat},${lng}` : encodeURIComponent(address);
    const url = Platform.select({
      ios: `maps://app?daddr=${destination}`,
      android: `google.navigation:q=${destination}`,
    });

    if (url) {
      Linking.openURL(url).catch(() => {
        Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${destination}`);
      });
    }
  }, []);

  const handleCall = useCallback((phone: string) => {
    Linking.openURL(`tel:${phone}`);
  }, []);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.semantic.background }]}>
        <ActivityIndicator size="large" color={tokens.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={currentLocation ? { ...currentLocation, latitudeDelta: 0.05, longitudeDelta: 0.05 } : INITIAL_REGION}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {/* Delivery markers */}
        {activeDeliveries.map((delivery) => (
          <React.Fragment key={delivery.id}>
            {/* Pickup marker */}
            {delivery.pickup_latitude && delivery.pickup_longitude && (
              <Marker
                coordinate={{
                  latitude: Number(delivery.pickup_latitude),
                  longitude: Number(delivery.pickup_longitude),
                }}
                title={`Pickup: ${delivery.tracking_number}`}
                description={delivery.pickup_address}
                pinColor={tokens.colors.primary}
                onPress={() => setSelectedDelivery(delivery)}
              />
            )}
            {/* Delivery marker */}
            {delivery.delivery_latitude && delivery.delivery_longitude && (
              <Marker
                coordinate={{
                  latitude: Number(delivery.delivery_latitude),
                  longitude: Number(delivery.delivery_longitude),
                }}
                title={`Delivery: ${delivery.tracking_number}`}
                description={delivery.delivery_address}
                pinColor={tokens.colors.success}
                onPress={() => setSelectedDelivery(delivery)}
              />
            )}
          </React.Fragment>
        ))}
      </MapView>

      {/* Header */}
      <SafeAreaView style={styles.headerContainer} edges={['top']}>
        <View style={[styles.header, { backgroundColor: theme.semantic.surface }]}>
          <Text style={[styles.headerTitle, { color: theme.semantic.text }]}>
            Delivery Map
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.semantic.textMuted }]}>
            {activeDeliveries.length} active {activeDeliveries.length === 1 ? 'delivery' : 'deliveries'}
          </Text>
        </View>
      </SafeAreaView>

      {/* Bottom Sheet */}
      {selectedDelivery && (
        <View style={[styles.bottomSheet, { backgroundColor: theme.semantic.surface }]}>
          <View style={styles.sheetHandle} />

          <View style={styles.deliveryInfo}>
            <View style={styles.deliveryHeader}>
              <Package color={tokens.colors.primary} size={20} />
              <Text style={[styles.trackingNumber, { color: theme.semantic.text }]}>
                {selectedDelivery.tracking_number}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      selectedDelivery.status === 'in_transit'
                        ? tokens.colors.warning + '20'
                        : tokens.colors.primary + '20',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    {
                      color:
                        selectedDelivery.status === 'in_transit'
                          ? tokens.colors.warning
                          : tokens.colors.primary,
                    },
                  ]}
                >
                  {selectedDelivery.status === 'in_transit' ? 'In Transit' : 'Assigned'}
                </Text>
              </View>
            </View>

            <View style={styles.addressRow}>
              <MapPin color={theme.semantic.textMuted} size={16} />
              <Text style={[styles.addressText, { color: theme.semantic.textMuted }]} numberOfLines={2}>
                {selectedDelivery.status === 'assigned'
                  ? selectedDelivery.pickup_address
                  : selectedDelivery.delivery_address}
              </Text>
            </View>

            <View style={styles.actionsRow}>
              <Pressable
                style={[styles.actionButton, { backgroundColor: tokens.colors.primary }]}
                onPress={() =>
                  handleNavigate(
                    selectedDelivery.status === 'assigned'
                      ? selectedDelivery.pickup_address
                      : selectedDelivery.delivery_address,
                    selectedDelivery.status === 'assigned'
                      ? Number(selectedDelivery.pickup_latitude)
                      : Number(selectedDelivery.delivery_latitude),
                    selectedDelivery.status === 'assigned'
                      ? Number(selectedDelivery.pickup_longitude)
                      : Number(selectedDelivery.delivery_longitude)
                  )
                }
              >
                <Navigation color="#fff" size={18} />
                <Text style={styles.actionButtonText}>Navigate</Text>
              </Pressable>

              {selectedDelivery.customer_phone && (
                <Pressable
                  style={[styles.actionButton, { backgroundColor: theme.semantic.surface, borderWidth: 1, borderColor: theme.semantic.border }]}
                  onPress={() => handleCall(selectedDelivery.customer_phone!)}
                >
                  <Phone color={theme.semantic.text} size={18} />
                  <Text style={[styles.actionButtonText, { color: theme.semantic.text }]}>Call</Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      )}

      {/* Empty State */}
      {activeDeliveries.length === 0 && (
        <View style={[styles.emptyOverlay, { backgroundColor: theme.semantic.background + 'CC' }]}>
          <Package color={theme.semantic.textMuted} size={48} />
          <Text style={[styles.emptyTitle, { color: theme.semantic.text }]}>
            No Active Deliveries
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.semantic.textMuted }]}>
            Claim packages to see them on the map
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    flex: 1,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  header: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    ...tokens.shadows.md,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
    ...tokens.shadows.lg,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  deliveryInfo: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  deliveryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  trackingNumber: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 16,
  },
  addressText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  emptyOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtitle: {
    fontSize: 14,
  },
});
