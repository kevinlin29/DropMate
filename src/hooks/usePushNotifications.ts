import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { registerForPushNotifications } from '@/store/slices/notificationsSlice';

/**
 * Hook to automatically handle push notification registration
 *
 * This hook:
 * 1. Registers push token when user logs in
 * 2. Re-registers on app foreground (if needed)
 * 3. Handles token refresh
 * 4. Cleans up on logout
 */
export const usePushNotifications = () => {
  const dispatch = useAppDispatch();
  const { user, status } = useAppSelector((state) => state.auth);
  const { permissionStatus, pushToken } = useAppSelector((state) => state.notifications);

  const hasRegistered = useRef(false);
  const appState = useRef(AppState.currentState);

  // Auto-register when user logs in
  useEffect(() => {
    const attemptRegistration = async () => {
      // Only register if:
      // 1. User is authenticated
      // 2. Haven't registered yet in this session
      // 3. Permissions are granted OR we can request them
      if (
        status === 'authenticated' &&
        user &&
        !hasRegistered.current
      ) {
        console.log('🔵 [AUTO-REGISTER] User authenticated, attempting push token registration...');

        try {
          const resultAction = await dispatch(registerForPushNotifications());

          if (registerForPushNotifications.fulfilled.match(resultAction) && resultAction.payload) {
            console.log('✅ [AUTO-REGISTER] Push token registered successfully');
            hasRegistered.current = true;
          } else {
            console.log('🟡 [AUTO-REGISTER] Push token registration skipped (permissions or device)');
          }
        } catch (error) {
          console.error('🔴 [AUTO-REGISTER] Failed to register push token:', error);
          // Will retry on next app foreground
        }
      }
    };

    attemptRegistration();
  }, [status, user, dispatch]);

  // Reset registration flag on logout
  useEffect(() => {
    if (status === 'idle' || !user) {
      hasRegistered.current = false;
      console.log('🔵 [AUTO-REGISTER] User logged out, reset registration flag');
    }
  }, [status, user]);

  // Re-register when app comes to foreground (handles token refresh)
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      // App came to foreground
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('🔵 [AUTO-REGISTER] App foregrounded');

        // Only re-register if user is logged in and we had registered before
        if (status === 'authenticated' && user && hasRegistered.current) {
          console.log('🔵 [AUTO-REGISTER] Checking if token needs refresh...');

          try {
            // Re-register (will use cached token if still valid)
            await dispatch(registerForPushNotifications());
            console.log('✅ [AUTO-REGISTER] Token refresh check complete');
          } catch (error) {
            console.error('🔴 [AUTO-REGISTER] Token refresh failed:', error);
          }
        }
      }

      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [status, user, dispatch]);

  return {
    isRegistered: hasRegistered.current,
    permissionStatus,
    pushToken,
  };
};
