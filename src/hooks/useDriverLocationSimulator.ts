import { useEffect, useRef } from 'react';
import { useDriver } from '@/stores/useDriver';

/**
 * Hook to simulate driver location updates for testing purposes
 * This simulates a driver moving along a route by updating their location periodically
 *
 * In production, this would be replaced with actual GPS tracking using expo-location
 */
export const useDriverLocationSimulator = (enabled: boolean = false) => {
  const updateLocation = useDriver((state) => state.updateLocation);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const stepRef = useRef(0);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Simulate a route in Toronto (origin → destination with small movements)
    const simulatedRoute = [
      { lat: 43.6532, lng: -79.3832 },  // King St (origin)
      { lat: 43.6560, lng: -79.3870 },  // Moving northwest
      { lat: 43.6590, lng: -79.3900 },  // Continue
      { lat: 43.6629, lng: -79.3957 },  // Queen St (stop 1)
      { lat: 43.6650, lng: -79.3980 },  // Moving
      { lat: 43.6685, lng: -79.3995 },  // Between stops
      { lat: 43.6710, lng: -79.4020 },  // Dundas St (stop 2)
      { lat: 43.6750, lng: -79.4050 },  // Continue north
      { lat: 43.6795, lng: -79.4090 },  // Getting closer
      { lat: 43.6850, lng: -79.4120 },  // Almost there
      { lat: 43.6890, lng: -79.4145 },  // Bloor St (destination)
    ];

    // Update location every 3 seconds
    intervalRef.current = setInterval(() => {
      const currentStep = stepRef.current % simulatedRoute.length;
      const location = simulatedRoute[currentStep];

      updateLocation(location.lat, location.lng);

      stepRef.current = currentStep + 1;

      console.log(`[Driver Simulator] Updated location to: ${location.lat}, ${location.lng}`);
    }, 3000);

    // Set initial location
    updateLocation(simulatedRoute[0].lat, simulatedRoute[0].lng);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, updateLocation]);
};
