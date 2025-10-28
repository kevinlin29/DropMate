import React, { useMemo } from 'react';
import MapView, { Marker, Polyline, Region as MapRegion } from 'react-native-maps';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';

import { LatLng, getRegionForCoordinates, toMapCoordinates } from '@/utils/map';

export type MapMarker = {
  id: string;
  coordinate: LatLng;
  title?: string;
  description?: string;
  pinColor?: string;
};

export type MapViewWrapperProps = {
  routeCoordinates?: LatLng[];
  markers?: MapMarker[];
  style?: StyleProp<ViewStyle>;
  initialRegion?: MapRegion;
  onMapReady?: () => void;
};

export const MapViewWrapper: React.FC<MapViewWrapperProps> = ({
  routeCoordinates,
  markers,
  style,
  initialRegion,
  onMapReady,
}) => {
  const computedRegion = useMemo(() => {
    if (initialRegion) {
      return initialRegion;
    }

    if (routeCoordinates && routeCoordinates.length > 0) {
      return getRegionForCoordinates(routeCoordinates);
    }

    if (markers && markers.length > 0) {
      const coords = markers.map((marker) => marker.coordinate);
      return getRegionForCoordinates(coords);
    }

    return undefined;
  }, [initialRegion, markers, routeCoordinates]);

  return (
    <MapView
      style={[styles.map, style]}
      initialRegion={computedRegion}
      onMapReady={onMapReady}
      accessibilityHint="Live courier map"
    >
      {routeCoordinates && routeCoordinates.length > 0 ? (
        <Polyline
          coordinates={routeCoordinates.map(toMapCoordinates)}
          strokeColor="#1497A1"
          strokeWidth={4}
        />
      ) : null}
      {markers?.map((marker) => (
        <Marker
          key={marker.id}
          coordinate={toMapCoordinates(marker.coordinate)}
          title={marker.title}
          description={marker.description}
          pinColor={marker.pinColor}
        />
      ))}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});
