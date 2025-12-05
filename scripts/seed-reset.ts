import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  shipments: '@dropmate/shipments/v1',
  routes: '@dropmate/routes/v1',
  seeded: '@dropmate/seeded/v1',
};

/**
 * Development helper to clear local shipment data and reapply the JSON seeds.
 * Run in an Expo dev console with:
 *   await (await import('../scripts/seed-reset')).resetLocalSeed();
 */
export const resetLocalSeed = async (): Promise<void> => {
  await AsyncStorage.multiRemove([
    STORAGE_KEYS.shipments,
    STORAGE_KEYS.routes,
    STORAGE_KEYS.seeded,
  ]);
};
