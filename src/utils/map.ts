export type LatLng = {
  lat: number;
  lng: number;
};

export type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

const MIN_DELTA = 0.01;
const PADDING_FACTOR = 0.1;

export const toMapCoordinates = ({ lat, lng }: LatLng) => ({
  latitude: lat,
  longitude: lng,
});

export const getRegionForCoordinates = (coordinates: LatLng[]): Region | undefined => {
  if (!coordinates.length) {
    return undefined;
  }

  if (coordinates.length === 1) {
    const { lat, lng } = coordinates[0];
    return {
      latitude: lat,
      longitude: lng,
      latitudeDelta: MIN_DELTA,
      longitudeDelta: MIN_DELTA,
    };
  }

  let minLat = coordinates[0].lat;
  let maxLat = coordinates[0].lat;
  let minLng = coordinates[0].lng;
  let maxLng = coordinates[0].lng;

  coordinates.forEach(({ lat, lng }) => {
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
  });

  const latitude = (minLat + maxLat) / 2;
  const longitude = (minLng + maxLng) / 2;
  const latitudeDelta = Math.max((maxLat - minLat) * (1 + PADDING_FACTOR), MIN_DELTA);
  const longitudeDelta = Math.max((maxLng - minLng) * (1 + PADDING_FACTOR), MIN_DELTA);

  return {
    latitude,
    longitude,
    latitudeDelta,
    longitudeDelta,
  };
};

export const polylineToLatLng = (polyline: Array<[number, number]>): LatLng[] =>
  polyline.map(([lat, lng]) => ({ lat, lng }));
