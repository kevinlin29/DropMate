import { NavigatorScreenParams } from '@react-navigation/native';

export type BottomTabParamList = {
  HomeTab: undefined;
  TrackTab: undefined;
  MapTab: undefined;
  SettingsTab: undefined;
};

export type DriverTabParamList = {
  DriverHomeTab: undefined;
  DeliveriesTab: undefined;
  DriverMapTab: undefined;
  SettingsTab: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Tutorial: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  Main: NavigatorScreenParams<BottomTabParamList> | NavigatorScreenParams<DriverTabParamList> | undefined;
  Profile: undefined;
  ShipmentDetails: { shipmentId: string };
  AddTracking: undefined;
  PlaceOrder: undefined;
  Notifications: undefined;
  // Driver-specific routes
  DriverDeliveryDetails: { deliveryId: number };
  AvailablePackages: undefined;
};




declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
