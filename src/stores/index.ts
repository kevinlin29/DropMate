import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';

import { authSlice } from './authSlice';
import { driverSlice } from './driverSlice';
import { uiSlice } from './uiSlice';

// Persist configuration for driver slice
const driverPersistConfig = {
  key: 'driver',
  storage: AsyncStorage,
};

// Persist configuration for UI slice  
const uiPersistConfig = {
  key: 'ui',
  storage: AsyncStorage,
};

const rootReducer = combineReducers({
  auth: authSlice.reducer,
  driver: persistReducer(driverPersistConfig, driverSlice.reducer),
  ui: persistReducer(uiPersistConfig, uiSlice.reducer),
});

export const store = configureStore({
  reducer: rootReducer,
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;