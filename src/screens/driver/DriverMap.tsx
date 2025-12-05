import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Navigation, MapPin, Play, Square, RefreshCw } from 'lucide-react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { tokens } from '@/theme/tokens';
import { MapViewSafe } from '@/components/MapViewSafe';
import { useDriverDeliveriesQuery } from '@/hooks/useDriverDeliveries';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import { useDriver } from '@/stores/useDriver';

export const DriverMapScreen: React.FC = () => {
  const theme = useTheme();
  const { data: deliveries } = useDriverDeliveriesQuery();
  const {
    isTracking,
    lastLocation,
    error: locationError,
    startTracking,
    stopTracking,
  } = useLocationTracking();

  const activeDelivery = deliveries?.find(
    (d) => d.status === 'in_transit' || d.status === 'assigned'
  );

  // Build markers for the map
  const markers = React.useMemo(() => {
    const result: Array<{
      id: string;
      coordinate: { lat: number; lng: number };
      type: 'origin' | 'destination' | 'driver';
      title?: string;
    }> = [];

    // Add driver location
    if (lastLocation) {
      result.push({
        id: 'driver',
        coordinate: {
          lat: lastLocation.coords.latitude,
          lng: lastLocation.coords.longitude,
        },
        type: 'driver',
        title: 'Your Location',
      });
    }

    return result;
  }, [lastLocation]);

  const handleToggleTracking = useCallback(() => {
    if (isTracking) {
      stopTracking();
    } else {
      startTracking();
    }
  }, [isTracking, startTracking, stopTracking]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: tokens.colors.primaryBeige }]}>
          <Text style={[styles.title, { color: theme.semantic.text }]}>Driver Map</Text>

          {/* Tracking Status */}
          <View style={styles.trackingStatus}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isTracking ? tokens.colors.success : theme.semantic.textMuted },
              ]}
            />
            <Text style={[styles.statusText, { color: theme.semantic.textMuted }]}>
              {isTracking ? 'Tracking Active' : 'Tracking Off'}
            </Text>
          </View>
        </View>

        {/* Map */}
        <View style={styles.mapContainer}>
          <MapViewSafe
            markers={markers}
            style={styles.map}
          />

          {/* Tracking Control */}
          <View style={styles.controlsContainer}>
            <Pressable
              style={[
                styles.trackingButton,
                {
                  backgroundColor: isTracking ? tokens.colors.error : tokens.colors.success,
                },
              ]}
              onPress={handleToggleTracking}
            >
              {isTracking ? (
                <>
                  <Square color="#fff" size={20} fill="#fff" />
                  <Text style={styles.trackingButtonText}>Stop Tracking</Text>
                </>
              ) : (
                <>
                  <Play color="#fff" size={20} fill="#fff" />
                  <Text style={styles.trackingButtonText}>Start Tracking</Text>
                </>
              )}
            </Pressable>
          </View>

          {/* Error Message */}
          {locationError && (
            <View style={[styles.errorBanner, { backgroundColor: tokens.colors.error }]}>
              <Text style={styles.errorText}>{locationError}</Text>
            </View>
          )}
        </View>

        {/* Active Delivery Info */}
        {activeDelivery && (
          <View style={[styles.deliveryInfo, { backgroundColor: theme.semantic.surface }]}>
            <View style={styles.deliveryHeader}>
              <Text style={[styles.deliveryLabel, { color: theme.semantic.textMuted }]}>
                Active Delivery
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: tokens.colors.success + '20' }]}>
                <Text style={[styles.badgeText, { color: tokens.colors.success }]}>
                  {activeDelivery.status === 'in_transit' ? 'In Transit' : 'Assigned'}
                </Text>
              </View>
            </View>

            <Text style={[styles.trackingNumber, { color: theme.semantic.text }]}>
              {activeDelivery.tracking_number}
            </Text>

            <View style={styles.addressRow}>
              <MapPin color={tokens.colors.error} size={16} />
              <Text
                style={[styles.addressText, { color: theme.semantic.textMuted }]}
                numberOfLines={1}
              >
                {activeDelivery.delivery_address}
              </Text>
            </View>
          </View>
        )}

        {/* No Active Delivery */}
        {!activeDelivery && (
          <View style={[styles.deliveryInfo, { backgroundColor: theme.semantic.surface }]}>
            <View style={styles.noDeliveryContent}>
              <Navigation color={theme.semantic.textMuted} size={32} />
              <Text style={[styles.noDeliveryText, { color: theme.semantic.textMuted }]}>
                No active delivery
              </Text>
              <Text style={[styles.noDeliverySubtext, { color: theme.semantic.textMuted }]}>
                Start a delivery to see route guidance
              </Text>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: tokens.colors.primaryBeige,
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
  },
  trackingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  trackingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    ...tokens.shadows.md,
  },
  trackingButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorBanner: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  deliveryInfo: {
    padding: 16,
    margin: 16,
    marginTop: 0,
    borderRadius: 16,
    gap: 8,
    ...tokens.shadows.sm,
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deliveryLabel: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  trackingNumber: {
    fontSize: 18,
    fontWeight: '600',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addressText: {
    fontSize: 14,
    flex: 1,
  },
  noDeliveryContent: {
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  noDeliveryText: {
    fontSize: 16,
    fontWeight: '500',
  },
  noDeliverySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});
