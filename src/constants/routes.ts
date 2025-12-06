export const ROUTES = {
  Splash: 'Splash',
  Tutorial: 'Tutorial',
  Login: 'Login',
  Signup: 'Signup',
  ForgotPassword: 'ForgotPassword',
  Main: 'Main',
  Profile: 'Profile',
  Messages: 'Messages',
  ShipmentDetails: 'ShipmentDetails',
  AddTracking: 'AddTracking',
  PlaceOrder: 'PlaceOrder',
  // Driver routes
  DriverRegistration: 'DriverRegistration',
  DeliveryDetails: 'DeliveryDetails',
} as const;

export const TABS = {
  Home: 'Home',
  Track: 'Track',
  Map: 'Map',
  Settings: 'Settings',
} as const;

export const DRIVER_TABS = {
  DriverHome: 'DriverHomeTab',
  DriverDeliveries: 'DriverDeliveriesTab',
  DriverMap: 'DriverMapTab',
  DriverSettings: 'DriverSettingsTab',
} as const;

export const DEEP_LINK_PATTERN = 'dropmate://track/:id';
