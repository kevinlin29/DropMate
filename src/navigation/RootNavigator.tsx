import React, { useMemo } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme, LinkingOptions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Home, Search, Map as MapIcon, Settings as SettingsIcon } from 'lucide-react-native';
import * as Linking from 'expo-linking';

import { useTheme } from '@/theme/ThemeProvider';
import { tokens } from '@/theme/tokens';
import { ROUTES, TABS, DRIVER_TABS } from '@/constants/routes';
import { RootStackParamList, BottomTabParamList } from './types';
import { AnimatedTabs } from './AnimatedTabs';
import { DriverTabs } from './DriverTabs';
import { useUserProfileQuery } from '@/hooks/useUserQuery';
import { useAppSelector } from '@/store/hooks';

// Screens
import { SplashScreen } from '@/screens/Splash';
import { TutorialScreen } from '@/screens/Tutorial';
import { LoginScreen } from '@/screens/Login';
import { SignupScreen } from '@/screens/Signup';
import { ForgotPasswordScreen } from '@/screens/ForgotPassword';
import { HomeScreen } from '@/screens/Home';
import { TrackScreen } from '@/screens/Track';
import { MapScreen } from '@/screens/Map';
import { SettingsScreen } from '@/screens/Settings';
import { ProfileScreen } from '@/screens/Profile';
import { ShipmentDetailsScreen } from '@/screens/ShipmentDetails';
import { AddTrackingSheetScreen } from '@/screens/AddTrackingSheet';
import { PlaceOrderScreen } from '@/screens/PlaceOrder';

// Driver screens
import { DeliveryDetailsScreen } from '@/screens/driver/DeliveryDetails';
import { DriverRegistrationScreen } from '@/screens/driver/DriverRegistration';

// Transitions
import {
  PremiumSlideRight,
  PremiumSlideBottom,
  PremiumFade,
  PremiumModal,
  NoAnimation,
} from '@/navigation/transitions';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

// ----------------------
// ROLE-BASED MAIN SCREEN
// ----------------------
const RoleBasedMainScreen = () => {
  const theme = useTheme();
  const authStatus = useAppSelector((state) => state.auth.status);
  const isAuthenticated = authStatus === 'authenticated';
  const { data: userProfile, isLoading, isFetching, error } = useUserProfileQuery();

  console.log('[RoleBasedMainScreen] State:', {
    authStatus,
    isAuthenticated,
    isLoading,
    isFetching,
    role: userProfile?.role,
    hasProfile: !!userProfile,
    error: error?.message,
  });

  // Show loading while auth is pending or profile is being fetched
  const shouldShowLoading = isLoading || (isAuthenticated && isFetching) || (isAuthenticated && !userProfile && !error);

  if (shouldShowLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.semantic.background }]}>
        <ActivityIndicator size="large" color={tokens.colors.primary} />
      </View>
    );
  }

  // Show driver tabs if user is authenticated AND is a driver
  if (isAuthenticated && userProfile?.role === 'driver') {
    console.log('[RoleBasedMainScreen] Showing DriverTabs');
    return <DriverTabs />;
  }

  // Default to customer tabs
  console.log('[RoleBasedMainScreen] Showing AnimatedTabs (customer)');
  return <AnimatedTabs />;
};

// ----------------------
// BOTTOM TAB NAVIGATOR
// ----------------------
const BottomTabs = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.semantic.text || tokens.colors.textPrimary,
        tabBarInactiveTintColor: theme.semantic.textMuted || tokens.colors.textSecondary,
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingTop: 8,
          backgroundColor: theme.semantic.surface || tokens.colors.surface,
          borderTopWidth: 0,
          ...tokens.shadows.lg,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarIcon: ({ focused, color }) => {
          let IconComponent;
          switch (route.name) {
            case 'Home': IconComponent = Home; break;
            case 'Track': IconComponent = Search; break;
            case 'Map': IconComponent = MapIcon; break;
            default: IconComponent = SettingsIcon;
          }

          if (focused) {
            return (
              <View style={styles.activeIconContainer}>
                <IconComponent color={theme.semantic.text} size={24} strokeWidth={2} />
              </View>
            );
          }

          return <IconComponent color={color} size={24} strokeWidth={2} />;
        },
        tabBarLabel: ({ focused, color }) =>
          focused ? null : <Text style={[styles.tabLabel, { color }]}>{route.name}</Text>,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Track" component={TrackScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

// ----------------------
// DEEP LINKING CONFIG
// ----------------------
const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.createURL('/'), 'dropmate://'],
  config: {
    screens: {
      [ROUTES.Splash]: 'splash',
      [ROUTES.Tutorial]: 'tutorial',
      [ROUTES.Login]: 'login',
      [ROUTES.Signup]: 'signup',
      [ROUTES.ForgotPassword]: 'forgot-password',
      [ROUTES.Main]: {
        path: 'main',
        screens: {
          [TABS.Home]: 'home',
          [TABS.Track]: 'track',
          [TABS.Map]: 'map',
          [TABS.Settings]: 'settings',
        },
      },
      [ROUTES.Profile]: 'profile',
      [ROUTES.ShipmentDetails]: {
        path: 'shipment/:id',
        parse: {
          id: (id: string) => Number(id),
        },
      },
      [ROUTES.AddTracking]: 'add-tracking',
      [ROUTES.PlaceOrder]: 'place-order',
    },
  },
};

// ----------------------
// ROOT NAVIGATOR
// ----------------------
export const RootNavigator = () => {
  const theme = useTheme();

  const navigationTheme = useMemo(() => {
    const base = theme.mode === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: theme.semantic.background,
        card: theme.semantic.surface,
        border: theme.semantic.border,
        text: theme.semantic.text,
      },
    };
  }, [theme]);

  return (
    <NavigationContainer theme={navigationTheme} linking={linking}>
      <Stack.Navigator
        initialRouteName={ROUTES.Splash}
        screenOptions={{
          headerShown: false,
          ...PremiumSlideRight,
        }}
      >
        <Stack.Screen name={ROUTES.Splash} component={SplashScreen} options={NoAnimation} />
        <Stack.Screen name={ROUTES.Tutorial} component={TutorialScreen} options={PremiumFade} />

        {/* AUTH FLOW */}
        <Stack.Screen name={ROUTES.Login} component={LoginScreen} options={PremiumFade} />
        <Stack.Screen name={ROUTES.Signup} component={SignupScreen} options={PremiumFade} />
        <Stack.Screen name={ROUTES.ForgotPassword} component={ForgotPasswordScreen} options={PremiumFade} />

        {/* TABS - Role-based (shows customer or driver tabs) */}
        <Stack.Screen name={ROUTES.Main} component={RoleBasedMainScreen} options={PremiumSlideRight} />

        {/* CUSTOMER PUSH SCREENS */}
        <Stack.Screen name={ROUTES.Profile} component={ProfileScreen} options={PremiumSlideRight} />
        <Stack.Screen name={ROUTES.ShipmentDetails} component={ShipmentDetailsScreen} options={PremiumSlideRight} />

        {/* DRIVER PUSH SCREENS */}
        <Stack.Screen name={ROUTES.DeliveryDetails} component={DeliveryDetailsScreen} options={PremiumSlideRight} />
        <Stack.Screen name={ROUTES.DriverRegistration} component={DriverRegistrationScreen} options={PremiumSlideBottom} />

        {/* MODALS + SHEETS */}
        <Stack.Screen name={ROUTES.AddTracking} component={AddTrackingSheetScreen} options={PremiumModal} />
        <Stack.Screen name={ROUTES.PlaceOrder} component={PlaceOrderScreen} options={PremiumSlideBottom} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: tokens.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadows.md,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
});
