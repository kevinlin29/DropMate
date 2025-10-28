import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MapPin } from 'lucide-react-native';

import { MapViewWrapper } from '@/components/MapViewWrapper';
import { CourierCard } from '@/components/CourierCard';
import { SearchBar } from '@/components/SearchBar';
import { ShipmentCard } from '@/components/ShipmentCard';
import { PlaceholderCard } from '@/components/PlaceholderCard';
import { useShipmentsListQuery, useShipmentRouteQuery } from '@/hooks/useShipmentsQuery';
import { useTheme } from '@/theme/ThemeProvider';
import { Shipment } from '@/types';
import { ROUTES } from '@/constants/routes';
import { RootStackParamList } from '@/navigation/types';
import { formatShipmentTitle } from '@/utils/format';
import { FEATURE_FLAGS } from '@/constants/featureFlags';

export const MapScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [search, setSearch] = useState('');

  const { data: shipments } = useShipmentsListQuery({ query: search });
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!shipments || shipments.length === 0) {
      return;
    }
    const preferred = shipments.find((shipment) => shipment.status === 'OUT_FOR_DELIVERY');
    setSelectedId((current) => current ?? preferred?.id ?? shipments[0]?.id);
  }, [shipments]);

  const selectedShipment = useMemo(
    () => shipments?.find((shipment) => shipment.id === selectedId),
    [selectedId, shipments],
  );

  const { data: routeData } = useShipmentRouteQuery(
    FEATURE_FLAGS.mapsEnabled ? selectedId : undefined,
  );

  const latestCheckpoint = selectedShipment
    ? selectedShipment.checkpoints[selectedShipment.checkpoints.length - 1]
    : undefined;

  const markers = useMemo(() => {
    if (!routeData || routeData.coordinates.length === 0) {
      return [];
    }

    const first = routeData.coordinates[0];
    const last = routeData.coordinates[routeData.coordinates.length - 1];

    return [
      {
        id: 'courier',
        coordinate: first,
        title: 'Courier',
        description: 'Current position',
        pinColor: theme.colors.primaryTeal,
      },
      {
        id: 'destination',
        coordinate: last,
        title: 'Destination',
        description: 'Delivery address',
        pinColor: theme.colors.accent,
      },
    ];
  }, [routeData, theme.colors.accent, theme.colors.primaryTeal]);

  const handleOpenDetails = (shipmentId: string) => {
    navigation.navigate(ROUTES.ShipmentDetails, { shipmentId });
  };

  const renderShipment = ({ item }: { item: Shipment }) => (
    <Pressable
      onPress={() => setSelectedId(item.id)}
      style={({ pressed }) => [
        styles.shipmentChip,
        {
          borderColor: item.id === selectedId ? theme.colors.primaryTeal : theme.semantic.border,
          backgroundColor:
            item.id === selectedId ? `${theme.colors.primaryTeal}20` : theme.semantic.surface,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <Text style={{ color: theme.semantic.text, fontWeight: '500' }}>{formatShipmentTitle(item)}</Text>
      <Text style={{ color: theme.semantic.textMuted, fontSize: 12 }}>{item.status}</Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.semantic.background }]}>
      <View style={styles.mapContainer}>
        {FEATURE_FLAGS.mapsEnabled ? (
          <MapViewWrapper routeCoordinates={routeData?.coordinates} markers={markers} />
        ) : (
          <View style={styles.placeholderWrapper}>
            <PlaceholderCard
              title="Live map coming soon"
              description="We’re finishing the integration. You’ll see courier locations and ETAs here once it’s ready."
              Icon={MapPin}
            />
          </View>
        )}
      </View>
      <View style={[styles.bottomSheet, { backgroundColor: theme.semantic.surface }]}>
        <CourierCard
          status={selectedShipment?.status ?? 'IN_TRANSIT'}
          etaIso={selectedShipment?.etaIso}
          location={latestCheckpoint?.location}
          updatedIso={selectedShipment?.lastUpdatedIso}
          onPress={() => selectedShipment && handleOpenDetails(selectedShipment.id)}
        />
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search deliveries"
          style={styles.searchBar}
        />
        <FlatList
          horizontal
          data={shipments}
          contentContainerStyle={styles.shipmentList}
          keyExtractor={(item) => item.id}
          renderItem={renderShipment}
          showsHorizontalScrollIndicator={false}
        />
        {selectedShipment ? (
          <ShipmentCard
            shipment={selectedShipment}
            compactTimeline
            onPress={() => handleOpenDetails(selectedShipment.id)}
          />
        ) : null}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
  },
  placeholderWrapper: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  bottomSheet: {
    padding: 16,
    gap: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  searchBar: {
    marginTop: 8,
  },
  shipmentList: {
    gap: 12,
  },
  shipmentChip: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    minWidth: 160,
    gap: 4,
  },
});
