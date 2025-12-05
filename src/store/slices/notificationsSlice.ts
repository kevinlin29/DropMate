import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { userService } from '@/api/userService';

const PUSH_TOKEN_KEY = 'dropmate_push_token';

export type NotificationSettings = {
  dailyReminderEnabled: boolean;
  dailyReminderTime: { hour: number; minute: number }; // 24-hour format
  shipmentStatusEnabled: boolean;
  driverProximityEnabled: boolean;
};

const DEFAULT_SETTINGS: NotificationSettings = {
  dailyReminderEnabled: true,
  dailyReminderTime: { hour: 9, minute: 0 }, // 9 AM
  shipmentStatusEnabled: true,
  driverProximityEnabled: true,
};

export type NotificationPermissionStatus = 'undetermined' | 'granted' | 'denied';

interface NotificationsState {
  permissionStatus: NotificationPermissionStatus;
  pushToken: string | null;
  settings: NotificationSettings;
  hydrated: boolean;
}

const initialState: NotificationsState = {
  permissionStatus: 'undetermined',
  pushToken: null,
  settings: DEFAULT_SETTINGS,
  hydrated: false,
};

// Async thunks
export const requestPermissions = createAsyncThunk(
  'notifications/requestPermissions',
  async (_, { rejectWithValue }) => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();

      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      const granted = finalStatus === 'granted';
      return granted ? 'granted' : 'denied';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return rejectWithValue('denied');
    }
  }
);

export const registerForPushNotifications = createAsyncThunk(
  'notifications/registerPush',
  async (_, { dispatch, rejectWithValue }) => {
    console.log('🔵 [PUSH] Starting push notification registration...');

    try {
      // Check if we're on a physical device
      if (!Device.isDevice) {
        console.warn('🟡 [PUSH] Must use physical device for push notifications');
        return null;
      }
      console.log('✅ [PUSH] Device check passed');

      // Request permissions first
      console.log('🔵 [PUSH] Requesting permissions...');
      const resultAction = await dispatch(requestPermissions());

      if (requestPermissions.rejected.match(resultAction) || resultAction.payload !== 'granted') {
        console.warn('🔴 [PUSH] Notification permission not granted');
        return null;
      }
      console.log('✅ [PUSH] Permissions granted');

      // Try to get push token (requires valid EAS project ID)
      let token = null;
      try {
        console.log('🔵 [PUSH] Getting Expo push token...');
        const tokenData = await Notifications.getExpoPushTokenAsync();
        token = tokenData.data;
        console.log('✅ [PUSH] Got push token:', token.substring(0, 30) + '...');
      } catch (error: any) {
        // If no valid project ID, push notifications won't work
        // but local notifications will still work fine
        if (error.message?.includes('projectId')) {
          console.warn('🔴 [PUSH] Push notifications unavailable: Invalid or missing EAS project ID');
          console.warn('Local notifications will still work. To enable push notifications, run: npx eas init');
          return null;
        }
        console.error('🔴 [PUSH] Error getting push token:', error);
        throw error; // Re-throw other errors
      }

      // Save token to secure storage
      console.log('🔵 [PUSH] Saving token to secure storage...');
      await SecureStore.setItemAsync(PUSH_TOKEN_KEY, token);
      console.log('✅ [PUSH] Token saved to secure storage');

      // Register token with backend (best effort - don't fail if backend is unavailable)
      try {
        console.log('🔵 [PUSH] Registering token with backend...');
        const response = await userService.registerPushToken(token);
        console.log('✅ [PUSH] Token registered with backend successfully!');
        console.log('✅ [PUSH] Backend response:', JSON.stringify(response));
      } catch (error: any) {
        console.error('🔴 [PUSH] Failed to register push token with backend');
        console.error('🔴 [PUSH] Error details:', error.message);
        console.error('🔴 [PUSH] Full error:', JSON.stringify(error, null, 2));
        // Continue anyway - local notifications will still work
      }

      // Configure Android notification channels
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#4A90E2',
        });

        await Notifications.setNotificationChannelAsync('shipment-updates', {
          name: 'Shipment Updates',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#4A90E2',
          description: 'Notifications about your shipment status changes',
        });

        await Notifications.setNotificationChannelAsync('reminders', {
          name: 'Reminders',
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 250],
          lightColor: '#4A90E2',
          description: 'Daily reminders to check your deliveries',
        });

        await Notifications.setNotificationChannelAsync('driver-proximity', {
          name: 'Driver Proximity',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#4A90E2',
          description: 'Alerts when driver is nearby',
        });
      }

      return token;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return rejectWithValue(null);
    }
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    updateSettings: (state, action: PayloadAction<Partial<NotificationSettings>>) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    hydrateNotifications: (
      state,
      action: PayloadAction<{
        pushToken: string | null;
        settings: NotificationSettings;
        permissionStatus: NotificationPermissionStatus;
      }>
    ) => {
      state.pushToken = action.payload.pushToken;
      state.settings = action.payload.settings;
      state.permissionStatus = action.payload.permissionStatus;
      state.hydrated = true;
    },
    setHydrated: (state, action: PayloadAction<boolean>) => {
      state.hydrated = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Request Permissions
    builder.addCase(requestPermissions.fulfilled, (state, action) => {
      state.permissionStatus = action.payload as NotificationPermissionStatus;
    });
    builder.addCase(requestPermissions.rejected, (state) => {
      state.permissionStatus = 'denied';
    });

    // Register Push
    builder.addCase(registerForPushNotifications.fulfilled, (state, action) => {
      if (action.payload) {
        state.pushToken = action.payload;
      }
    });
  },
});

export const { updateSettings, hydrateNotifications, setHydrated } = notificationsSlice.actions;
export default notificationsSlice.reducer;
