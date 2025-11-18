import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type DriverState = {
  isDriverMode: boolean;
  driverId?: string;
  driverName?: string;
  vehicleInfo?: {
    type: string;
    plateNumber: string;
  };
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
};

const initialState: DriverState = {
  isDriverMode: false,
  driverId: undefined,
  driverName: undefined,
  vehicleInfo: undefined,
  currentLocation: undefined,
};

export const driverSlice = createSlice({
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
    setVehicleInfo: (state, action: PayloadAction<{ type: string; plateNumber: string }>) => {
      state.vehicleInfo = {
        type: action.payload.type,
        plateNumber: action.payload.plateNumber,
      };
    },
    updateLocation: (state, action: PayloadAction<{ latitude: number; longitude: number }>) => {
      state.currentLocation = {
        latitude: action.payload.latitude,
        longitude: action.payload.longitude,
      };
    },
    clearDriverData: (state) => {
      state.isDriverMode = false;
      state.driverId = undefined;
      state.driverName = undefined;
      state.vehicleInfo = undefined;
      state.currentLocation = undefined;
    },
  },
});