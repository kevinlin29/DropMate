import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { connectSocket, disconnectSocket } from '@/store/middleware/socketMiddleware';
import { shipmentKeys } from '@/api/queryKeys';

/**
 * Hook to orchestrate real-time data synchronization
 *
 * This hook coordinates 3 data channels:
 * 1. WebSocket - Real-time updates when app is OPEN
 * 2. Push Notifications - Alerts when app is CLOSED
 * 3. App Foreground - Refresh when app comes to foreground
 *
 * Benefits:
 * - Always shows fresh data
 * - No duplicate updates
 * - Efficient (only refreshes when needed)
 */
export const useRealtimeSync = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const { user, status } = useAppSelector((state) => state.auth);
  const appState = useRef(AppState.currentState);
  const isWebSocketConnected = useRef(false);

  // Connect to WebSocket when user is authenticated and app is active
  useEffect(() => {
    console.log('🔍 [SYNC] useEffect triggered - status:', status, 'user:', user?.email, 'appState:', appState.current);

    if (status !== 'authenticated' || !user) {
      // Disconnect if not authenticated
      if (isWebSocketConnected.current) {
        console.log('🔌 [SYNC] Disconnecting WebSocket (user logged out)');
        dispatch(disconnectSocket());
        isWebSocketConnected.current = false;
      }
      console.log('⏸️ [SYNC] Not connecting - user not authenticated');
      return;
    }

    // Only connect if app is in foreground
    if (appState.current === 'active' && !isWebSocketConnected.current) {
      console.log('🔌 [SYNC] Attempting WebSocket connection via Redux middleware...');
      dispatch(connectSocket());
      isWebSocketConnected.current = true;
    }

    return () => {
      // Keep connection alive on unmount unless user logs out
      // This allows switching screens without reconnecting
    };
  }, [status, user, dispatch]);

  // Handle app state changes (foreground/background)
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      const isComingToForeground =
        appState.current.match(/inactive|background/) && nextAppState === 'active';

      const isGoingToBackground =
        appState.current === 'active' && nextAppState.match(/inactive|background/);

      if (isComingToForeground && status === 'authenticated') {
        console.log('🔄 [SYNC] App foregrounded - refreshing data...');

        // Refresh all shipments (might have changed while app was in background)
        await queryClient.invalidateQueries({ queryKey: shipmentKeys.all });

        // Reconnect WebSocket if disconnected
        if (!isWebSocketConnected.current) {
          console.log('🔌 [SYNC] Reconnecting WebSocket...');
          dispatch(connectSocket());
          isWebSocketConnected.current = true;
        }

        console.log('✅ [SYNC] Data refreshed');
      }

      if (isGoingToBackground) {
        console.log('🔌 [SYNC] App backgrounded - disconnecting WebSocket to save battery');

        // Disconnect WebSocket to save battery (push notifications will handle updates)
        if (isWebSocketConnected.current) {
          dispatch(disconnectSocket());
          isWebSocketConnected.current = false;
        }
      }

      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [status, queryClient, dispatch]);

  // Subscribe to user's shipments on WebSocket
  useEffect(() => {
    if (isWebSocketConnected.current && user) {
      // Subscribe to shipment updates for this user
      // Note: This depends on your backend WebSocket implementation
      // You may need to emit a 'subscribe:user' event with user.id

      console.log('📡 [SYNC] Subscribing to user shipment updates');

      // Example: If your backend supports subscribing to all user shipments
      // notificationService.socket?.emit('subscribe:user', user.uid);
    }
  }, [user, isWebSocketConnected.current]);

  return {
    isConnected: isWebSocketConnected.current,
  };
};
