import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, ListRenderItem, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import dayjs from 'dayjs';
import { Plus, ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Shipment } from '@/types';
import { useShipmentsListQuery } from '@/hooks/useShipmentsQuery';
import { ShipmentCard } from '@/components/ShipmentCard';
import { SearchBar } from '@/components/SearchBar';
import { FilterChips, FilterChipOption } from '@/components/FilterChips';
import { Skeleton } from '@/components/Skeleton';
import { EmptyState } from '@/components/EmptyState';
import { useTheme } from '@/theme/ThemeProvider';
import { useUI, FilterPreset } from '@/stores/useUI';
import { ROUTES, TABS } from '@/constants/routes';
import { RootStackParamList } from '@/navigation/types';
import { t } from '@/i18n/i18n';

const filterOptions: FilterChipOption<FilterPreset>[] = [
  { label: t('filters.all'), value: 'ALL' },
  { label: t('filters.inTransit'), value: 'IN_TRANSIT' },
  { label: t('filters.today'), value: 'TODAY' },
  { label: t('filters.week'), value: 'WEEK' },
];

const statusFilterForPreset: Partial<Record<FilterPreset, Shipment['status']>> = {
  IN_TRANSIT: 'IN_TRANSIT',
};

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const theme = useTheme();
  const activeFilter = useUI((state) => state.activeFilter);
  const setActiveFilter = useUI((state) => state.setActiveFilter);

  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, error, refetch, isRefetching } = useShipmentsListQuery({
    query: searchQuery,
    status: statusFilterForPreset[activeFilter],
  });

  const filteredShipments = useMemo(() => {
    if (!data) {
      return [] as Shipment[];
    }

    if (activeFilter === 'TODAY') {
      return data.filter((shipment) => dayjs(shipment.lastUpdatedIso).isSame(dayjs(), 'day'));
    }

    if (activeFilter === 'WEEK') {
      return data.filter((shipment) => dayjs(shipment.lastUpdatedIso).isAfter(dayjs().subtract(7, 'day')));
    }

    return data;
  }, [activeFilter, data]);

  const currentShipment = filteredShipments[0];
  const recentShipments = filteredShipments.slice(1);

  const renderRecentItem = useCallback<ListRenderItem<Shipment>>(
    ({ item }) => (
      <ShipmentCard
        shipment={item}
        onPress={() => navigation.navigate(ROUTES.ShipmentDetails, { shipmentId: item.id })}
        compactTimeline
        style={styles.recentCard}
      />
    ),
    [navigation],
  );

  const handleAddTracking = () => {
    navigation.navigate(ROUTES.AddTracking);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.semantic.background }]}>
      <View style={styles.container}>
        <Text style={[styles.heading, { color: theme.semantic.text }]}>{t('home.title')}</Text>
        <SearchBar
          placeholder={t('home.searchPlaceholder')}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchBar}
        />
        <FilterChips
          options={filterOptions}
          value={activeFilter}
          onChange={setActiveFilter}
          style={styles.filterRow}
          chipStyle={styles.chipOverride}
        />
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.semantic.text }]}>Current shipment</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate(ROUTES.Main, { screen: TABS.Track })}
              style={styles.viewAll}
            >
              <Text style={[styles.viewAllLabel, { color: theme.colors.accent }]}>{t('shipments.viewAll')}</Text>
              <ChevronRight color={theme.colors.accent} size={18} />
            </Pressable>
          </View>
          {isLoading && !data ? (
            <View style={styles.skeletonCard}>
              <Skeleton height={24} />
              <Skeleton height={16} width="80%" />
              <View style={styles.timelineSkeleton}>
                <Skeleton height={12} />
                <Skeleton height={12} width="60%" />
              </View>
            </View>
          ) : currentShipment ? (
            <ShipmentCard
              shipment={currentShipment}
              onPress={() => navigation.navigate(ROUTES.ShipmentDetails, { shipmentId: currentShipment.id })}
              compactTimeline={false}
            />
          ) : (
            <EmptyState
              title={t('home.emptyTitle')}
              description={t('home.emptyBody')}
              actionLabel={t('home.emptyAction')}
              onActionPress={handleAddTracking}
            />
          )}
        </View>
        <View style={[styles.sectionHeader, styles.sectionDivider]}>
          <Text style={[styles.sectionTitle, { color: theme.semantic.text }]}>{t('shipments.recent')}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate(ROUTES.Main, { screen: TABS.Track })}
            style={styles.viewAll}
          >
            <Text style={[styles.viewAllLabel, { color: theme.colors.accent }]}>{t('shipments.viewAll')}</Text>
            <ChevronRight color={theme.colors.accent} size={18} />
          </Pressable>
        </View>
        {error ? (
          <View style={styles.errorBox}>
            <Text style={[styles.errorText, { color: theme.colors.error }]}>{t('errors.generic')}</Text>
            <Pressable onPress={() => void refetch()} accessibilityRole="button">
              <Text style={[styles.retry, { color: theme.colors.accent }]}>Retry</Text>
            </Pressable>
          </View>
        ) : null}
        <FlatList
          data={recentShipments}
          keyExtractor={(item) => item.id}
          renderItem={renderRecentItem}
          contentContainerStyle={styles.listContent}
          initialNumToRender={5}
          windowSize={6}
          maxToRenderPerBatch={6}
          ListEmptyComponent={
            !isLoading && filteredShipments.length <= 1 ? (
              <Text style={[styles.emptyText, { color: theme.semantic.textMuted }]}>{t('errors.noResults')}</Text>
            ) : null
          }
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={() => { void refetch(); }} />
          }
          showsVerticalScrollIndicator={false}
          removeClippedSubviews
        />
      </View>
      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: theme.colors.primaryTeal,
            opacity: pressed ? 0.9 : 1,
          },
        ]}
        onPress={handleAddTracking}
      >
        <Plus color="#FFFFFF" size={24} />
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    gap: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: '600',
  },
  searchBar: {
    marginTop: 4,
  },
  section: {
    gap: 16,
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionDivider: {
    marginTop: 12,
    marginBottom: 12,
  },
  chipOverride: {
    minWidth: 90,
    paddingHorizontal: 14,
  },
  filterRow: {
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  skeletonCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  timelineSkeleton: {
    gap: 8,
  },
  listContent: {
    paddingBottom: 200,
    gap: 18,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
  },
  recentCard: {
    marginHorizontal: 0,
  },
  errorBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  errorText: {
    fontSize: 14,
  },
  retry: {
    fontSize: 14,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
});
