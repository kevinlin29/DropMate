import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Package, TrendingUp, Clock, ChevronRight } from 'lucide-react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { tokens } from '@/theme/tokens';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setOnlineStatus } from '@/store/slices/driverSlice';
import { DriverTabParamList, RootStackParamList } from '@/navigation/types';

type DriverHomeNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<DriverTabParamList, 'DriverHomeTab'>,
  NativeStackNavigationProp<RootStackParamList>
>;
import { DriverStatusToggle } from '@/components/driver/DriverStatusToggle';
import { DriverStatsCard } from '@/components/driver/DriverStatsCard';
import { useDriverDeliveriesQuery, useAvailablePackagesQuery } from '@/hooks/driver/useDriverQueries';

export const DriverHomeScreen: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<DriverHomeNavigationProp>();

  const isOnline = useAppSelector((state) => state.driver.isOnline);
  const driverName = useAppSelector((state) => state.driver.driverName);
  const driverStatus = useAppSelector((state) => state.driver.driverStatus);
  const activeDeliveryId = useAppSelector((state) => state.driver.activeDeliveryId);

  const { data: deliveriesData, refetch: refetchDeliveries, isRefetching: isRefetchingDeliveries } = useDriverDeliveriesQuery();
  const { data: availableData, refetch: refetchAvailable, isRefetching: isRefetchingAvailable } = useAvailablePackagesQuery();

  const isRefetching = isRefetchingDeliveries || isRefetchingAvailable;

  const handleRefresh = useCallback(() => {
    refetchDeliveries();
    refetchAvailable();
  }, [refetchDeliveries, refetchAvailable]);

  const handleToggleOnline = useCallback((value: boolean) => {
    dispatch(setOnlineStatus(value));
  }, [dispatch]);

  const activeDeliveries = deliveriesData?.deliveries?.filter(
    (d) => d.status === 'assigned' || d.status === 'in_transit'
  ) || [];

  const completedToday = deliveriesData?.deliveries?.filter(
    (d) => d.status === 'delivered'
  ).length || 0;

  const availableCount = availableData?.count || 0;

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.semantic.background }]}
      edges={['top']}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor={theme.semantic.text}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: theme.semantic.textMuted }]}>
              Welcome back,
            </Text>
            <Text style={[styles.driverName, { color: theme.semantic.text }]}>
              {driverName || 'Driver'}
            </Text>
          </View>
          <DriverStatusToggle
            isOnline={isOnline}
            onToggle={handleToggleOnline}
          />
        </View>

        {/* Status Banner */}
        <View
          style={[
            styles.statusBanner,
            {
              backgroundColor: isOnline
                ? tokens.colors.success + '20'
                : theme.semantic.surface,
              borderColor: isOnline
                ? tokens.colors.success
                : theme.semantic.border,
            },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isOnline ? tokens.colors.success : theme.semantic.textMuted },
            ]}
          />
          <Text style={[styles.statusText, { color: theme.semantic.text }]}>
            {driverStatus === 'on_delivery'
              ? 'On Delivery'
              : isOnline
              ? 'Online - Ready for deliveries'
              : 'Offline'}
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <DriverStatsCard
            icon={Package}
            label="Available"
            value={availableCount}
            color={tokens.colors.primary}
          />
          <DriverStatsCard
            icon={TrendingUp}
            label="Completed"
            value={completedToday}
            color={tokens.colors.success}
          />
          <DriverStatsCard
            icon={Clock}
            label="Active"
            value={activeDeliveries.length}
            color={tokens.colors.warning}
          />
        </View>

        {/* Active Delivery Card */}
        {activeDeliveryId && activeDeliveries.length > 0 && (
          <Pressable
            style={({ pressed }) => [
              styles.activeDeliveryCard,
              {
                backgroundColor: theme.semantic.surface,
                borderColor: tokens.colors.primary,
                opacity: pressed ? 0.9 : 1,
              },
            ]}
            onPress={() => navigation.navigate('DeliveryDetails', { deliveryId: activeDeliveryId })}
          >
            <View style={styles.activeDeliveryHeader}>
              <Text style={[styles.activeDeliveryTitle, { color: theme.semantic.text }]}>
                Active Delivery
              </Text>
              <ChevronRight color={theme.semantic.textMuted} size={20} />
            </View>
            <Text style={[styles.activeDeliveryAddress, { color: theme.semantic.textMuted }]}>
              {activeDeliveries[0]?.delivery_address || 'Loading...'}
            </Text>
          </Pressable>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.semantic.text }]}>
            Quick Actions
          </Text>
          <View style={styles.actionsRow}>
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                {
                  backgroundColor: theme.semantic.surface,
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
              onPress={() => navigation.navigate('DriverDeliveriesTab')}
            >
              <Package color={tokens.colors.primary} size={24} />
              <Text style={[styles.actionLabel, { color: theme.semantic.text }]}>
                View Packages
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    marginBottom: 4,
  },
  driverName: {
    fontSize: 24,
    fontWeight: '700',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  activeDeliveryCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 20,
  },
  activeDeliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeDeliveryTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  activeDeliveryAddress: {
    fontSize: 14,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
    ...tokens.shadows.sm,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
});
