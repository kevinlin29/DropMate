import { NavigatorScreenParams } from '@react-navigation/native';

// Customer bottom tabs
export type BottomTabParamList = {
  HomeTab: undefined;
  TrackTab: undefined;
  MapTab: undefined;
  SettingsTab: undefined;
};

// Driver bottom tabs
export type DriverTabParamList = {
  DriverHomeTab: undefined;
  DriverDeliveriesTab: undefined;
  DriverMapTab: undefined;
  DriverSettingsTab: undefined;
};

export type RootStackParamList = {
  // Auth flow
  Splash: undefined;
  Tutorial: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  // Main tabs (shows customer or driver tabs based on role)
  Main: NavigatorScreenParams<BottomTabParamList> | NavigatorScreenParams<DriverTabParamList> | undefined;
  // Customer screens
  Profile: undefined;
  ShipmentDetails: { shipmentId: string };
  AddTracking: undefined;
  PlaceOrder: undefined;
  // Driver screens
  DriverRegistration: undefined;
  DeliveryDetails: { deliveryId: number };
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
