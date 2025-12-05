import { useEffect, useCallback, useRef } from 'react';
import * as Location from 'expo-location';
import { AppState, AppStateStatus } from 'react-native';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateLocation } from '@/store/slices/driverSlice';
import { locationService } from '@/api/locationClient';

const LOCATION_UPDATE_INTERVAL = 10000; // 10 seconds
const LOCATION_DISTANCE_INTERVAL = 50; // 50 meters

type LocationTrackingOptions = {
  enabled?: boolean;
};

export const useDriverLocationTracking = (options: LocationTrackingOptions = {}) => {
  const { enabled = true } = options;
  const dispatch = useAppDispatch();

  const isOnline = useAppSelector((state) => state.driver.isOnline);
  const driverId = useAppSelector((state) => state.driver.driverId);

  const watchIdRef = useRef<Location.LocationSubscription | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const shouldTrack = enabled && isOnline && !!driverId;

  // Request location permissions
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();

      if (foregroundStatus !== 'granted') {
        console.warn('[GPS] Foreground location permission not granted');
        return false;
      }

      console.log('[GPS] Location permissions granted');
      return true;
    } catch (error) {
      console.error('[GPS] Error requesting permissions:', error);
      return false;
    }
  }, []);

  // Handle location update
  const handleLocationUpdate = useCallback(
    async (location: Location.LocationObject) => {
      const { latitude, longitude, accuracy } = location.coords;

      // Update Redux store
      dispatch(updateLocation({ latitude, longitude }));

      // Send to backend
      if (driverId) {
        try {
          await locationService.recordLocation(Number(driverId), {
            latitude,
            longitude,
            accuracy: accuracy ?? 0,
          });
          console.log(`[GPS] Location sent: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        } catch (error) {
          console.error('[GPS] Failed to send location to backend:', error);
        }
      }
    },
    [driverId, dispatch]
  );

  // Start location tracking
  const startTracking = useCallback(async () => {
    if (watchIdRef.current) {
      console.log('[GPS] Already tracking');
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      return;
    }

    try {
      console.log('[GPS] Starting location tracking...');

      // Get initial location
      const initialLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      await handleLocationUpdate(initialLocation);

      // Start watching for updates
      watchIdRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: LOCATION_DISTANCE_INTERVAL,
          timeInterval: LOCATION_UPDATE_INTERVAL,
        },
        handleLocationUpdate
      );

      console.log('[GPS] Location tracking started');
    } catch (error) {
      console.error('[GPS] Error starting location tracking:', error);
    }
  }, [requestPermissions, handleLocationUpdate]);

  // Stop location tracking
  const stopTracking = useCallback(() => {
    if (watchIdRef.current) {
      watchIdRef.current.remove();
      watchIdRef.current = null;
      console.log('[GPS] Location tracking stopped');
    }
  }, []);

  // Handle app state changes (pause when backgrounded)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appStateRef.current.match(/active/) &&
        nextAppState.match(/inactive|background/)
      ) {
        // App going to background - stop tracking to save battery
        console.log('[GPS] App backgrounded - pausing tracking');
        stopTracking();
      } else if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App coming to foreground - resume tracking if needed
        if (shouldTrack) {
          console.log('[GPS] App foregrounded - resuming tracking');
          startTracking();
        }
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [shouldTrack, startTracking, stopTracking]);

  // Start/stop tracking based on online status
  useEffect(() => {
    if (shouldTrack) {
      startTracking();
    } else {
      stopTracking();
    }

    return () => {
      stopTracking();
    };
  }, [shouldTrack, startTracking, stopTracking]);

  // Get current location on demand
  const getCurrentLocation = useCallback(async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      dispatch(
        updateLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        })
      );

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
      };
    } catch (error) {
      console.error('[GPS] Error getting current location:', error);
      return null;
    }
  }, [requestPermissions, dispatch]);

  return {
    startTracking,
    stopTracking,
    getCurrentLocation,
    isTracking: !!watchIdRef.current,
  };
};
