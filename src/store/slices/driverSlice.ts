import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface VehicleInfo {
  type: string;
  plateNumber: string;
}

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export type DriverStatus = 'offline' | 'available' | 'on_delivery';

interface DriverState {
  isDriverMode: boolean;
  driverId?: string;
  driverName?: string;
  vehicleInfo?: VehicleInfo;
  currentLocation?: LocationCoordinates;
  // New driver-specific state
  isOnline: boolean;
  driverStatus: DriverStatus;
  activeDeliveryId?: number;
  licenseNumber?: string;
}

const initialState: DriverState = {
  isDriverMode: false,
  driverId: undefined,
  driverName: undefined,
  vehicleInfo: undefined,
  currentLocation: undefined,
  // New defaults
  isOnline: false,
  driverStatus: 'offline',
  activeDeliveryId: undefined,
  licenseNumber: undefined,
};

const driverSlice = createSlice({
  name: 'driver',
  initialState,
  reducers: {
    setDriverMode: (state, action: PayloadAction<boolean>) => {
      state.isDriverMode = action.payload;
    },
    setDriverInfo: (state, action: PayloadAction<{ driverId: string; driverName: string }>) => {
      state.driverId = action.payload.driverId;
      state.driverName = action.payload.driverName;
    },
    setVehicleInfo: (state, action: PayloadAction<VehicleInfo>) => {
      state.vehicleInfo = action.payload;
    },
    setLicenseNumber: (state, action: PayloadAction<string>) => {
      state.licenseNumber = action.payload;
    },
    updateLocation: (state, action: PayloadAction<LocationCoordinates>) => {
      state.currentLocation = action.payload;
    },
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
      state.driverStatus = action.payload ? 'available' : 'offline';
    },
    setDriverStatus: (state, action: PayloadAction<DriverStatus>) => {
      state.driverStatus = action.payload;
      state.isOnline = action.payload !== 'offline';
    },
    setActiveDelivery: (state, action: PayloadAction<number | undefined>) => {
      state.activeDeliveryId = action.payload;
      if (action.payload) {
        state.driverStatus = 'on_delivery';
        state.isOnline = true;
      } else if (state.isOnline) {
        state.driverStatus = 'available';
      }
    },
    clearDriverData: (state) => {
      state.isDriverMode = false;
      state.driverId = undefined;
      state.driverName = undefined;
      state.vehicleInfo = undefined;
      state.currentLocation = undefined;
      state.isOnline = false;
      state.driverStatus = 'offline';
      state.activeDeliveryId = undefined;
      state.licenseNumber = undefined;
    },
  },
});

export const {
  setDriverMode,
  setDriverInfo,
  setVehicleInfo,
  setLicenseNumber,
  updateLocation,
  setOnlineStatus,
  setDriverStatus,
  setActiveDelivery,
  clearDriverData,
} = driverSlice.actions;

export default driverSlice.reducer;
