import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Package, MapPin, User, Phone } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '@/theme/ThemeProvider';
import { tokens } from '@/theme/tokens';
import { useDriverDeliveriesQuery } from '@/hooks/useDriverDeliveries';
import { RootStackParamList } from '@/navigation/types';
import { ROUTES } from '@/constants/routes';
import { DeliveryItem, ShipmentStatus } from '@/types/backend';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type FilterTab = 'all' | 'assigned' | 'in_transit' | 'delivered';

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'assigned', label: 'Assigned' },
  { key: 'in_transit', label: 'In Transit' },
  { key: 'delivered', label: 'Delivered' },
];

export const DriverDeliveriesScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: deliveries, isLoading, refetch } = useDriverDeliveriesQuery();

  const filteredDeliveries = React.useMemo(() => {
    if (!deliveries) return [];

    let filtered = deliveries;

    // Filter by status
    if (activeFilter !== 'all') {
      filtered = filtered.filter((d) => d.status === activeFilter);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.tracking_number.toLowerCase().includes(query) ||
          d.delivery_address.toLowerCase().includes(query) ||
          d.customer_name?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [deliveries, activeFilter, searchQuery]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

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

  const renderDeliveryItem = ({ item }: { item: DeliveryItem }) => (
    <Pressable
      style={[styles.deliveryCard, { backgroundColor: theme.semantic.surface }]}
      onPress={() => navigation.navigate(ROUTES.DriverDeliveryDetails, { deliveryId: item.id })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.trackingRow}>
          <Package color={theme.semantic.text} size={16} />
          <Text style={[styles.trackingNumber, { color: theme.semantic.text }]}>
            {item.tracking_number}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusLabel(item.status)}
          </Text>
        </View>
      </View>

      <View style={styles.addressSection}>
        <View style={styles.addressRow}>
          <View style={[styles.addressDot, { backgroundColor: tokens.colors.success }]} />
          <Text style={[styles.addressLabel, { color: theme.semantic.textMuted }]}>Pickup</Text>
        </View>
        <Text style={[styles.addressText, { color: theme.semantic.text }]} numberOfLines={1}>
          {item.pickup_address}
        </Text>
      </View>

      <View style={styles.addressSection}>
        <View style={styles.addressRow}>
          <View style={[styles.addressDot, { backgroundColor: tokens.colors.error }]} />
          <Text style={[styles.addressLabel, { color: theme.semantic.textMuted }]}>Delivery</Text>
        </View>
        <Text style={[styles.addressText, { color: theme.semantic.text }]} numberOfLines={1}>
          {item.delivery_address}
        </Text>
      </View>

      <View style={styles.customerRow}>
        <View style={styles.customerInfo}>
          <User color={theme.semantic.textMuted} size={14} />
          <Text style={[styles.customerText, { color: theme.semantic.textMuted }]}>
            {item.customer_name}
          </Text>
        </View>
        {item.customer_phone && (
          <View style={styles.customerInfo}>
            <Phone color={theme.semantic.textMuted} size={14} />
            <Text style={[styles.customerText, { color: theme.semantic.textMuted }]}>
              {item.customer_phone}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: tokens.colors.primaryBeige }]}
      edges={['top', 'left', 'right']}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.semantic.text }]}>My Deliveries</Text>
        </View>

        {/* Search */}
        <View style={[styles.searchContainer, { backgroundColor: theme.semantic.surface }]}>
          <Search color={theme.semantic.textMuted} size={20} />
          <TextInput
            style={[styles.searchInput, { color: theme.semantic.text }]}
            placeholder="Search by tracking # or address"
            placeholderTextColor={theme.semantic.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          {FILTER_TABS.map((tab) => (
            <Pressable
              key={tab.key}
              style={[
                styles.filterTab,
                activeFilter === tab.key && {
                  backgroundColor: tokens.colors.packageOrange,
                },
              ]}
              onPress={() => setActiveFilter(tab.key)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  { color: activeFilter === tab.key ? '#fff' : theme.semantic.textMuted },
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Deliveries List */}
        <FlatList
          data={filteredDeliveries}
          renderItem={renderDeliveryItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={[styles.emptyState, { backgroundColor: theme.semantic.surface }]}>
              <Package color={theme.semantic.textMuted} size={48} />
              <Text style={[styles.emptyTitle, { color: theme.semantic.text }]}>
                No deliveries found
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.semantic.textMuted }]}>
                {activeFilter === 'all'
                  ? 'Claim packages to start delivering'
                  : `No ${activeFilter.replace('_', ' ')} deliveries`}
              </Text>
            </View>
          }
        />
      </View>
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
  header: {
    padding: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
    ...tokens.shadows.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },
  deliveryCard: {
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
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  addressSection: {
    gap: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  addressLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  addressText: {
    fontSize: 14,
    marginLeft: 14,
  },
  customerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5E5',
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  customerText: {
    fontSize: 13,
  },
  emptyState: {
    padding: 48,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
    ...tokens.shadows.sm,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});
