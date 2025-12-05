import { useState, useEffect, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import { locationService } from '@/api/locationClient';
import { useUserProfileQuery } from '@/hooks/useUserQuery';
import { useDriver, DriverState } from '@/stores/useDriver';

const TRACKING_INTERVAL_MS = 30000; // 30 seconds

export const useLocationTracking = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [lastLocation, setLastLocation] = useState<Location.LocationObject | null>(null);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { data: userData } = useUserProfileQuery();
  const updateLocation = useDriver((state: DriverState) => state.updateLocation);

  const requestPermissions = useCallback(async () => {
    const { status: foreground } = await Location.requestForegroundPermissionsAsync();
    if (foreground !== 'granted') {
      throw new Error('Location permission is required for tracking');
    }

    // Try to get background permission (nice to have, not required)
    try {
      await Location.requestBackgroundPermissionsAsync();
    } catch {
      console.log('Background location not available');
    }

    return { foreground };
  }, []);

  const getCurrentLocation = useCallback(async () => {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    setLastLocation(location);
    return location;
  }, []);

  const sendLocationToServer = useCallback(
    async (location: Location.LocationObject) => {
      const driverId = userData?.driver_id;
      if (!driverId) {
        console.warn('No driver ID available, skipping location update');
        return;
      }

      try {
        await locationService.recordLocation(driverId, {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy || 10,
        });

        // Update local store
        updateLocation(location.coords.latitude, location.coords.longitude);

        console.log('[LocationTracking] Location sent to server');
      } catch (err) {
        console.error('[LocationTracking] Failed to send location:', err);
      }
    },
    [userData?.driver_id, updateLocation]
  );

  const startTracking = useCallback(async () => {
    try {
      setError(null);
      await requestPermissions();
      setIsTracking(true);

      // Get initial location
      const location = await getCurrentLocation();
      await sendLocationToServer(location);

      // Set up interval for updates
      intervalRef.current = setInterval(async () => {
        try {
          const loc = await getCurrentLocation();
          await sendLocationToServer(loc);
        } catch (err) {
          console.error('[LocationTracking] Interval update error:', err);
        }
      }, TRACKING_INTERVAL_MS);

      console.log('[LocationTracking] Tracking started');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start tracking';
      setError(message);
      setIsTracking(false);
    }
  }, [requestPermissions, getCurrentLocation, sendLocationToServer]);

  const stopTracking = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsTracking(false);
    console.log('[LocationTracking] Tracking stopped');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isTracking,
    lastLocation,
    error,
    startTracking,
    stopTracking,
  };
};
