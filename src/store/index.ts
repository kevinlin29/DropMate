import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient } from '@tanstack/react-query';

import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import notificationsReducer from './slices/notificationsSlice';
import driverReducer from './slices/driverSlice';
import { createSocketMiddleware } from './middleware/socketMiddleware';

// Persist configs for different slices
const uiPersistConfig = {
  key: 'ui',
  storage: AsyncStorage,
  whitelist: ['onboardingComplete', 'themePreference'], // Only persist these fields
};

const driverPersistConfig = {
  key: 'driver',
  storage: AsyncStorage,
};

// Note: Auth and notifications use SecureStore directly in their thunks,
// so we don't use redux-persist for sensitive data

const rootReducer = combineReducers({
  auth: authReducer,
  ui: persistReducer(uiPersistConfig, uiReducer),
  notifications: notificationsReducer,
  driver: persistReducer(driverPersistConfig, driverReducer),
});

// Create store factory that accepts QueryClient
export const createStore = (queryClient: QueryClient) => {
  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [
            FLUSH,
            REHYDRATE,
            PAUSE,
            PERSIST,
            PURGE,
            REGISTER,
            'auth/setUser',
            'socket/shipmentStatusUpdate',
            'socket/shipmentLocationUpdate',
            'socket/driverLocationUpdate',
          ],
          ignoredPaths: ['auth.user'],
        },
      }).concat(createSocketMiddleware(queryClient)),
  });

  return store;
};

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof createStore>;
export type AppDispatch = AppStore['dispatch'];

// Export persistor creator
export const createPersistor = (store: AppStore) => {
  return persistStore(store);
};
