import type { AppStore } from './index';

// Store instance will be set when the store is created
let storeInstance: AppStore | null = null;

export const setStoreInstance = (store: AppStore) => {
  storeInstance = store;
};

export const getStoreInstance = (): AppStore | null => {
  return storeInstance;
};
