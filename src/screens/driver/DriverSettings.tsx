import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User,
  Car,
  CreditCard,
  Bell,
  Moon,
  LogOut,
  ChevronRight,
  Shield,
} from 'lucide-react-native';
import { signOut } from 'firebase/auth';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '@/theme/ThemeProvider';
import { tokens } from '@/theme/tokens';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { clearDriverData, setOnlineStatus } from '@/store/slices/driverSlice';
import { auth } from '@/config/firebase';
import { DriverStatusToggle } from '@/components/driver/DriverStatusToggle';
import { RootStackParamList } from '@/navigation/types';
import { ROUTES } from '@/constants/routes';

type SettingItemProps = {
  icon: React.ComponentType<{ color: string; size: number }>;
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  danger?: boolean;
};

const SettingItem: React.FC<SettingItemProps> = ({
  icon: Icon,
  label,
  value,
  onPress,
  showChevron = true,
  danger = false,
}) => {
  const theme = useTheme();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.settingItem,
        {
          backgroundColor: theme.semantic.surface,
          opacity: pressed && onPress ? 0.9 : 1,
        },
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: danger ? tokens.colors.error + '15' : tokens.colors.primary + '15' },
        ]}
      >
        <Icon color={danger ? tokens.colors.error : tokens.colors.primary} size={20} />
      </View>
      <View style={styles.settingContent}>
        <Text
          style={[
            styles.settingLabel,
            { color: danger ? tokens.colors.error : theme.semantic.text },
          ]}
        >
          {label}
        </Text>
        {value && (
          <Text style={[styles.settingValue, { color: theme.semantic.textMuted }]}>
            {value}
          </Text>
        )}
      </View>
      {showChevron && onPress && (
        <ChevronRight color={theme.semantic.textMuted} size={20} />
      )}
    </Pressable>
  );
};

export const DriverSettingsScreen: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const driverName = useAppSelector((state) => state.driver.driverName);
  const vehicleInfo = useAppSelector((state) => state.driver.vehicleInfo);
  const licenseNumber = useAppSelector((state) => state.driver.licenseNumber);
  const isOnline = useAppSelector((state) => state.driver.isOnline);

  const handleToggleOnline = useCallback(
    (value: boolean) => {
      dispatch(setOnlineStatus(value));
    },
    [dispatch]
  );

  const handleSignOut = useCallback(() => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              dispatch(clearDriverData());
              // Clear all React Query cache to remove stale user profile data
              queryClient.clear();
              await signOut(auth);
              // Navigate to login screen
              navigation.reset({ index: 0, routes: [{ name: ROUTES.Login }] });
            } catch (error) {
              console.error('Sign out error:', error);
            }
          },
        },
      ]
    );
  }, [dispatch, queryClient, navigation]);

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.semantic.background }]}
      edges={['top']}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.semantic.text }]}>Settings</Text>
        </View>

        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: theme.semantic.surface }]}>
          <View style={styles.profileAvatar}>
            <User color={tokens.colors.primary} size={32} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: theme.semantic.text }]}>
              {driverName || 'Driver'}
            </Text>
            <Text style={[styles.profileRole, { color: theme.semantic.textMuted }]}>
              DropMate Driver
            </Text>
          </View>
          <DriverStatusToggle isOnline={isOnline} onToggle={handleToggleOnline} />
        </View>

        {/* Driver Info Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.semantic.textMuted }]}>
            DRIVER INFO
          </Text>
          <View style={[styles.sectionContent, { backgroundColor: theme.semantic.surface }]}>
            <SettingItem
              icon={User}
              label="Name"
              value={driverName || 'Not set'}
              showChevron={false}
            />
            <View style={[styles.divider, { backgroundColor: theme.semantic.border }]} />
            <SettingItem
              icon={Car}
              label="Vehicle"
              value={vehicleInfo ? `${vehicleInfo.type} - ${vehicleInfo.plateNumber}` : 'Not set'}
              showChevron={false}
            />
            <View style={[styles.divider, { backgroundColor: theme.semantic.border }]} />
            <SettingItem
              icon={CreditCard}
              label="License"
              value={licenseNumber || 'Not set'}
              showChevron={false}
            />
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.semantic.textMuted }]}>
            PREFERENCES
          </Text>
          <View style={[styles.sectionContent, { backgroundColor: theme.semantic.surface }]}>
            <SettingItem
              icon={Bell}
              label="Notifications"
              onPress={() => {}}
            />
            <View style={[styles.divider, { backgroundColor: theme.semantic.border }]} />
            <SettingItem
              icon={Moon}
              label="Appearance"
              value={theme.mode === 'dark' ? 'Dark' : 'Light'}
              onPress={() => {}}
            />
            <View style={[styles.divider, { backgroundColor: theme.semantic.border }]} />
            <SettingItem
              icon={Shield}
              label="Privacy & Security"
              onPress={() => {}}
            />
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.semantic.textMuted }]}>
            ACCOUNT
          </Text>
          <View style={[styles.sectionContent, { backgroundColor: theme.semantic.surface }]}>
            <SettingItem
              icon={LogOut}
              label="Sign Out"
              onPress={handleSignOut}
              showChevron={false}
              danger
            />
          </View>
        </View>

        {/* Version */}
        <Text style={[styles.version, { color: theme.semantic.textMuted }]}>
          DropMate Driver v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    ...tokens.shadows.sm,
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: tokens.colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
  },
  profileRole: {
    fontSize: 14,
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginLeft: 32,
    marginBottom: 8,
  },
  sectionContent: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingContent: {
    flex: 1,
    marginLeft: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingValue: {
    fontSize: 14,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginLeft: 64,
  },
  version: {
    textAlign: 'center',
    fontSize: 13,
    marginTop: 8,
  },
});
