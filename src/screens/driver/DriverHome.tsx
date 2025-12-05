import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Package, MapPin, Clock, ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '@/theme/ThemeProvider';
import { tokens } from '@/theme/tokens';
import { useUserProfileQuery } from '@/hooks/useUserQuery';
import { useDriverDeliveriesQuery } from '@/hooks/useDriverDeliveries';
import { RootStackParamList } from '@/navigation/types';
import { ROUTES } from '@/constants/routes';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const DriverHomeScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { data: userData } = useUserProfileQuery();
  const { data: deliveries, isLoading } = useDriverDeliveriesQuery();

  const activeDeliveries = deliveries?.filter(
    (d) => d.status === 'assigned' || d.status === 'in_transit'
  ) || [];

  const todayDelivered = deliveries?.filter(
    (d) => d.status === 'delivered'
  ).length || 0;

  const driverName = userData?.driver_name || userData?.customer_name || 'Driver';

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: tokens.colors.primaryBeige }]}
      edges={['top', 'left', 'right']}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: theme.semantic.textMuted }]}>
            Welcome back,
          </Text>
          <Text style={[styles.name, { color: theme.semantic.text }]}>
            {driverName}
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: theme.semantic.surface }]}>
            <Package color={tokens.colors.packageOrange} size={24} />
            <Text style={[styles.statValue, { color: theme.semantic.text }]}>
              {activeDeliveries.length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.semantic.textMuted }]}>
              Active
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.semantic.surface }]}>
            <Clock color={tokens.colors.success} size={24} />
            <Text style={[styles.statValue, { color: theme.semantic.text }]}>
              {todayDelivered}
            </Text>
            <Text style={[styles.statLabel, { color: theme.semantic.textMuted }]}>
              Completed
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.semantic.text }]}>
            Quick Actions
          </Text>

          <Pressable
            style={[styles.actionCard, { backgroundColor: theme.semantic.surface }]}
            onPress={() => navigation.navigate(ROUTES.AvailablePackages)}
          >
            <View style={styles.actionContent}>
              <View style={[styles.actionIcon, { backgroundColor: tokens.colors.packageOrange + '20' }]}>
                <Package color={tokens.colors.packageOrange} size={20} />
              </View>
              <View style={styles.actionText}>
                <Text style={[styles.actionTitle, { color: theme.semantic.text }]}>
                  Find Packages
                </Text>
                <Text style={[styles.actionSubtitle, { color: theme.semantic.textMuted }]}>
                  Browse available deliveries
                </Text>
              </View>
            </View>
            <ChevronRight color={theme.semantic.textMuted} size={20} />
          </Pressable>
        </View>

        {/* Active Deliveries */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.semantic.text }]}>
            Active Deliveries
          </Text>

          {isLoading ? (
            <View style={[styles.emptyCard, { backgroundColor: theme.semantic.surface }]}>
              <Text style={[styles.emptyText, { color: theme.semantic.textMuted }]}>
                Loading...
              </Text>
            </View>
          ) : activeDeliveries.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: theme.semantic.surface }]}>
              <Package color={theme.semantic.textMuted} size={32} />
              <Text style={[styles.emptyText, { color: theme.semantic.textMuted }]}>
                No active deliveries
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.semantic.textMuted }]}>
                Check available packages to start delivering
              </Text>
            </View>
          ) : (
            activeDeliveries.slice(0, 3).map((delivery) => (
              <Pressable
                key={delivery.id}
                style={[styles.deliveryCard, { backgroundColor: theme.semantic.surface }]}
                onPress={() => navigation.navigate(ROUTES.DriverDeliveryDetails, { deliveryId: delivery.id })}
              >
                <View style={styles.deliveryHeader}>
                  <Text style={[styles.trackingNumber, { color: theme.semantic.text }]}>
                    {delivery.tracking_number}
                  </Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: delivery.status === 'in_transit' ? tokens.colors.success + '20' : tokens.colors.packageOrange + '20' }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: delivery.status === 'in_transit' ? tokens.colors.success : tokens.colors.packageOrange }
                    ]}>
                      {delivery.status === 'in_transit' ? 'In Transit' : 'Assigned'}
                    </Text>
                  </View>
                </View>
                <View style={styles.deliveryAddress}>
                  <MapPin color={theme.semantic.textMuted} size={14} />
                  <Text
                    style={[styles.addressText, { color: theme.semantic.textMuted }]}
                    numberOfLines={1}
                  >
                    {delivery.delivery_address}
                  </Text>
                </View>
              </Pressable>
            ))
          )}
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
  content: {
    padding: 20,
    gap: 24,
  },
  header: {
    gap: 4,
  },
  greeting: {
    fontSize: 16,
  },
  name: {
    fontSize: 28,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
    ...tokens.shadows.sm,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 14,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    ...tokens.shadows.sm,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    gap: 2,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionSubtitle: {
    fontSize: 14,
  },
  emptyCard: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
    ...tokens.shadows.sm,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  deliveryCard: {
    padding: 16,
    borderRadius: 16,
    gap: 8,
    ...tokens.shadows.sm,
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trackingNumber: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  deliveryAddress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addressText: {
    fontSize: 14,
    flex: 1,
  },
});
