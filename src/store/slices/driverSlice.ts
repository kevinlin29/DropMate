import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface VehicleInfo {
  type: string;
  plateNumber: string;
}

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

interface DriverState {
  isDriverMode: boolean;
  driverId?: string;
  driverName?: string;
  vehicleInfo?: VehicleInfo;
  currentLocation?: LocationCoordinates;
}

const initialState: DriverState = {
  isDriverMode: false,
  driverId: undefined,
  driverName: undefined,
  vehicleInfo: undefined,
  currentLocation: undefined,
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
    updateLocation: (state, action: PayloadAction<LocationCoordinates>) => {
      state.currentLocation = action.payload;
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

export const {
  setDriverMode,
  setDriverInfo,
  setVehicleInfo,
  updateLocation,
  clearDriverData,
} = driverSlice.actions;

export default driverSlice.reducer;
