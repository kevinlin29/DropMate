import { NavigatorScreenParams } from '@react-navigation/native';

export type BottomTabParamList = {
  HomeTab: undefined;
  TrackTab: undefined;
  MapTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Tutorial: undefined;
  Login: undefined;
  Main: NavigatorScreenParams<BottomTabParamList> | undefined;
  ShipmentDetails: { shipmentId: string };
  AddTracking: undefined;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
