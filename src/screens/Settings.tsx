import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LogOut, Truck } from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';

import { NotificationsGate } from '@/features/notifications/NotificationsGate';
import { useTheme } from '@/theme/ThemeProvider';
import { tokens } from '@/theme/tokens';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { ThemePreference, setThemePreference } from '@/store/slices/uiSlice';
import { signOutThunk } from '@/store/slices/authSlice';
import { RootStackParamList } from '@/navigation/types';
import { ROUTES } from '@/constants/routes';
import { t } from '@/i18n/i18n';
import { useUserProfileQuery } from '@/hooks/useUserQuery';

const themeOptions: ThemePreference[] = ['system', 'light', 'dark'];

export const SettingsScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const themePreference = useAppSelector((state) => state.ui.themePreference);
  const { data: userProfile } = useUserProfileQuery();

  const isCustomer = userProfile?.role === 'customer';

  const handleSignOut = async () => {
    // Clear all React Query cache to remove stale user profile data
    queryClient.clear();
    await dispatch(signOutThunk());
    navigation.reset({ index: 0, routes: [{ name: ROUTES.Login }] });
  };

  const handleBecomeDriver = () => {
    navigation.navigate(ROUTES.DriverRegistration);
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.semantic.background }]}
      edges={['top', 'left', 'right']}
    >
      <View style={styles.container}>
        <Text style={[styles.heading, { color: theme.semantic.text }]}>Settings</Text>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.semantic.text }]}>{t('profile.theme')}</Text>
          <View style={styles.themeOptions}>
            {themeOptions.map((option) => {
              const isActive = option === themePreference;
              return (
                <Pressable
                  key={option}
                  onPress={() => dispatch(setThemePreference(option))}
                  style={({ pressed }) => [
                    styles.themeChip,
                    {
                      backgroundColor: isActive ? theme.colors.primaryTeal : theme.semantic.surface,
                      borderColor: isActive ? theme.colors.primaryTeal : theme.semantic.border,
                      opacity: pressed ? 0.9 : 1,
                    },
                  ]}
                >
                  <Text style={{ color: isActive ? '#FFFFFF' : theme.semantic.text, fontWeight: '500' }}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
        <View style={styles.section}>
          <NotificationsGate />
        </View>

        {/* Become a Driver - only show for customers */}
        {isCustomer && (
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.driverButton,
              {
                backgroundColor: `${tokens.colors.primary}14`,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
            onPress={handleBecomeDriver}
          >
            <Truck color={tokens.colors.primary} size={20} />
            <Text style={[styles.driverLabel, { color: tokens.colors.primary }]}>Become a Driver</Text>
          </Pressable>
        )}

        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.signOutButton,
            {
              backgroundColor: `${theme.colors.error}14`,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
          onPress={handleSignOut}
        >
          <LogOut color={theme.colors.error} size={20} />
          <Text style={[styles.signOutLabel, { color: theme.colors.error }]}>{t('profile.signOut')}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
    gap: 24,
  },
  heading: {
    fontSize: 24,
    fontWeight: '600',
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  themeChip: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  signOutButton: {
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  signOutLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  driverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  driverLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});
