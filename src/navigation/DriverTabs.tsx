import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { View, Platform, StyleSheet } from 'react-native';
import { Home, Package, Map as MapIcon, Settings as SettingsIcon } from 'lucide-react-native';

import { DriverTabParamList } from './types';
import { useTheme } from '@/theme/ThemeProvider';
import { tokens } from '@/theme/tokens';

// Driver screens
import { DriverHomeScreen, DriverDeliveriesScreen, DriverMapScreen } from '@/screens/driver';
import { SettingsScreen } from '@/screens/Settings';

const Tab = createBottomTabNavigator<DriverTabParamList>();

// Animated wrapper for smooth tab transitions
const FadeWrapper = ({ children, isActive }: { children: React.ReactNode; isActive: boolean }) => {
  const progress = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(isActive ? 1 : 0, { duration: 260 });
  }, [isActive, progress]);

  const anim = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 10 }],
  }));

  return <Animated.View style={[{ flex: 1 }, anim]}>{children}</Animated.View>;
};

export const DriverTabs = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState('DriverHomeTab');

  return (
    <Tab.Navigator
      screenListeners={{
        state: (e) => {
          const nextTab = e.data.state?.routeNames[e.data.state.index];
          if (nextTab) setActiveTab(nextTab);
        },
      }}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.semantic.text,
        tabBarInactiveTintColor: theme.semantic.textMuted,
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingTop: 8,
          backgroundColor: theme.semantic.surface,
          borderTopWidth: 0,
          ...tokens.shadows.lg,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarIcon: ({ focused, color }) => {
          const icons: Record<string, typeof Home> = {
            DriverHomeTab: Home,
            DeliveriesTab: Package,
            DriverMapTab: MapIcon,
            SettingsTab: SettingsIcon,
          };

          const Icon = icons[route.name];

          if (focused) {
            return (
              <View style={styles.activeIconContainer}>
                <Icon color={theme.semantic.text} size={24} strokeWidth={2} />
              </View>
            );
          }

          return <Icon color={color} size={24} strokeWidth={2} />;
        },
      })}
    >
      <Tab.Screen name="DriverHomeTab" options={{ tabBarLabel: 'Home' }}>
        {() => (
          <FadeWrapper isActive={activeTab === 'DriverHomeTab'}>
            <DriverHomeScreen />
          </FadeWrapper>
        )}
      </Tab.Screen>

      <Tab.Screen name="DeliveriesTab" options={{ tabBarLabel: 'Deliveries' }}>
        {() => (
          <FadeWrapper isActive={activeTab === 'DeliveriesTab'}>
            <DriverDeliveriesScreen />
          </FadeWrapper>
        )}
      </Tab.Screen>

      <Tab.Screen name="DriverMapTab" options={{ tabBarLabel: 'Map' }}>
        {() => (
          <FadeWrapper isActive={activeTab === 'DriverMapTab'}>
            <DriverMapScreen />
          </FadeWrapper>
        )}
      </Tab.Screen>

      <Tab.Screen name="SettingsTab" options={{ tabBarLabel: 'Settings' }}>
        {() => (
          <FadeWrapper isActive={activeTab === 'SettingsTab'}>
            <SettingsScreen />
          </FadeWrapper>
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  activeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: tokens.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadows.md,
  },
});
