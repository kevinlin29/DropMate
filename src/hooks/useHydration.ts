import { useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as Notifications from 'expo-notifications';
import { useAppDispatch } from '@/store/hooks';
import { initializeAuthListener } from '@/store/slices/authSlice';
import { hydrateNotifications, NotificationPermissionStatus, NotificationSettings } from '@/store/slices/notificationsSlice';

const PUSH_TOKEN_KEY = 'dropmate_push_token';
const NOTIFICATION_SETTINGS_KEY = 'dropmate_notification_settings';

const DEFAULT_SETTINGS = {
  dailyReminderEnabled: true,
  dailyReminderTime: { hour: 9, minute: 0 },
  shipmentStatusEnabled: true,
  driverProximityEnabled: true,
};

/**
 * Hook to hydrate auth and notification state from storage on app launch
 */
export const useHydration = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Initialize Firebase auth listener
    const unsubscribe = initializeAuthListener(dispatch);

    // Hydrate notifications
    const hydrateNotificationsState = async () => {
      try {
        // Load saved push token
        const savedToken = await SecureStore.getItemAsync(PUSH_TOKEN_KEY);

        // Load notification settings
        const savedSettingsStr = await SecureStore.getItemAsync(NOTIFICATION_SETTINGS_KEY);
        const savedSettings: NotificationSettings = savedSettingsStr
          ? JSON.parse(savedSettingsStr)
          : DEFAULT_SETTINGS;

        // Check current permission status
        const { status } = await Notifications.getPermissionsAsync();
        const permissionStatus: NotificationPermissionStatus =
          status === 'granted' ? 'granted' : status === 'denied' ? 'denied' : 'undetermined';

        dispatch(
          hydrateNotifications({
            pushToken: savedToken,
            settings: savedSettings,
            permissionStatus,
          })
        );
      } catch (error) {
        console.error('Error hydrating notification state:', error);
        dispatch(
          hydrateNotifications({
            pushToken: null,
            settings: DEFAULT_SETTINGS,
            permissionStatus: 'undetermined',
          })
        );
      }
    };

    hydrateNotificationsState();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [dispatch]);
};
