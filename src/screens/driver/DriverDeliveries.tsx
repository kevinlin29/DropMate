import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Package, Inbox } from 'lucide-react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { tokens } from '@/theme/tokens';
import { RootStackParamList } from '@/navigation/types';
import { DeliveryCard } from '@/components/driver/DeliveryCard';
import { AvailablePackageCard } from '@/components/driver/AvailablePackageCard';
import {
  useDriverDeliveriesQuery,
  useAvailablePackagesQuery,
  useClaimPackageMutation,
} from '@/hooks/driver/useDriverQueries';
import type { DeliveryItem, AvailablePackage, ShipmentStatus } from '@/types/backend';

type TabType = 'available' | 'my_deliveries';

export const DriverDeliveriesScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [activeTab, setActiveTab] = useState<TabType>('available');
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | undefined>(undefined);

  const {
    data: deliveriesData,
    refetch: refetchDeliveries,
    isRefetching: isRefetchingDeliveries,
    isLoading: isLoadingDeliveries,
  } = useDriverDeliveriesQuery(statusFilter);

  const {
    data: availableData,
    refetch: refetchAvailable,
    isRefetching: isRefetchingAvailable,
    isLoading: isLoadingAvailable,
  } = useAvailablePackagesQuery();

  const claimMutation = useClaimPackageMutation();

  const isRefetching = isRefetchingDeliveries || isRefetchingAvailable;
  const isLoading = isLoadingDeliveries || isLoadingAvailable;

  const handleRefresh = useCallback(() => {
    refetchDeliveries();
    refetchAvailable();
  }, [refetchDeliveries, refetchAvailable]);

  const handleClaimPackage = useCallback(
    async (packageId: number) => {
      try {
        await claimMutation.mutateAsync(packageId);
      } catch (error) {
        console.error('Failed to claim package:', error);
      }
    },
    [claimMutation]
  );

  const handleDeliveryPress = useCallback(
    (deliveryId: number) => {
      navigation.navigate('DeliveryDetails', { deliveryId });
    },
    [navigation]
  );

  const renderAvailableItem = useCallback(
    ({ item }: { item: AvailablePackage }) => (
      <AvailablePackageCard
        package={item}
        onClaim={() => handleClaimPackage(item.id)}
        isClaiming={claimMutation.isPending}
      />
    ),
    [handleClaimPackage, claimMutation.isPending]
  );

  const renderDeliveryItem = useCallback(
    ({ item }: { item: DeliveryItem }) => (
      <DeliveryCard
        delivery={item}
        onPress={() => handleDeliveryPress(item.id)}
      />
    ),
    [handleDeliveryPress]
  );

  const availablePackages = availableData?.packages || [];
  const myDeliveries = deliveriesData?.deliveries || [];

  const renderEmptyState = (type: TabType) => (
    <View style={styles.emptyState}>
      <Inbox color={theme.semantic.textMuted} size={48} />
      <Text style={[styles.emptyTitle, { color: theme.semantic.text }]}>
        {type === 'available' ? 'No Available Packages' : 'No Deliveries'}
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.semantic.textMuted }]}>
        {type === 'available'
          ? 'Check back later for new packages to deliver'
          : 'Claim packages to start delivering'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.semantic.background }]}
      edges={['top']}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.semantic.text }]}>Deliveries</Text>
      </View>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: theme.semantic.surface }]}>
        <Pressable
          style={[
            styles.tab,
            activeTab === 'available' && {
              backgroundColor: tokens.colors.primary,
            },
          ]}
          onPress={() => setActiveTab('available')}
        >
          <Package
            color={activeTab === 'available' ? '#fff' : theme.semantic.textMuted}
            size={18}
          />
          <Text
            style={[
              styles.tabText,
              {
                color: activeTab === 'available' ? '#fff' : theme.semantic.textMuted,
              },
            ]}
          >
            Available ({availablePackages.length})
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.tab,
            activeTab === 'my_deliveries' && {
              backgroundColor: tokens.colors.primary,
            },
          ]}
          onPress={() => setActiveTab('my_deliveries')}
        >
          <Package
            color={activeTab === 'my_deliveries' ? '#fff' : theme.semantic.textMuted}
            size={18}
          />
          <Text
            style={[
              styles.tabText,
              {
                color: activeTab === 'my_deliveries' ? '#fff' : theme.semantic.textMuted,
              },
            ]}
          >
            My Deliveries ({myDeliveries.length})
          </Text>
        </Pressable>
      </View>

      {/* Filter chips for my deliveries */}
      {activeTab === 'my_deliveries' && (
        <View style={styles.filterContainer}>
          {([
            { key: undefined, label: 'All' },
            { key: 'assigned' as ShipmentStatus, label: 'Assigned' },
            { key: 'in_transit' as ShipmentStatus, label: 'In Transit' },
          ] as const).map((filter) => (
            <Pressable
              key={filter.key ?? 'all'}
              style={[
                styles.filterChip,
                {
                  backgroundColor:
                    statusFilter === filter.key
                      ? tokens.colors.primary
                      : theme.semantic.surface,
                },
              ]}
              onPress={() => setStatusFilter(filter.key)}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color:
                      statusFilter === filter.key ? '#fff' : theme.semantic.text,
                  },
                ]}
              >
                {filter.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* List */}
      {activeTab === 'available' ? (
        <FlatList
          data={availablePackages}
          renderItem={renderAvailableItem}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={handleRefresh}
              tintColor={theme.semantic.text}
            />
          }
          ListEmptyComponent={!isLoading ? renderEmptyState('available') : null}
        />
      ) : (
        <FlatList
          data={myDeliveries}
          renderItem={renderDeliveryItem}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={handleRefresh}
              tintColor={theme.semantic.text}
            />
          }
          ListEmptyComponent={!isLoading ? renderEmptyState('my_deliveries') : null}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    paddingTop: 4,
    gap: 12,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
