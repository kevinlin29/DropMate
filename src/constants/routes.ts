export const ROUTES = {
  Splash: 'Splash',
  Tutorial: 'Tutorial',
  Login: 'Login',
  Main: 'Main',
  ShipmentDetails: 'ShipmentDetails',
  AddTracking: 'AddTracking',
} as const;

export const TABS = {
  Home: 'HomeTab',
  Track: 'TrackTab',
  Map: 'MapTab',
  Profile: 'ProfileTab',
} as const;

export const DEEP_LINK_PATTERN = 'dropmate://track/:id';
