import React, { useEffect, useRef } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { RootNavigator } from '@/navigation/RootNavigator';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { createStore, createPersistor } from '@/store';
import { setStoreInstance } from '@/store/storeInstance';
import { useAppSelector } from '@/store/hooks';
import { useHydration } from '@/hooks/useHydration';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { NotificationListener } from '@/components/NotificationListener';
import { configureNotificationHandler } from '@/services/notificationService';

const queryClient = new QueryClient();
const store = createStore(queryClient);
const persistor = createPersistor(store);

// Set store instance for non-React modules (like API client)
setStoreInstance(store);

// Configure how notifications are displayed when app is in foreground
configureNotificationHandler();

// Inner component that has access to QueryClient and Redux
const AppContent: React.FC = () => {
  const notificationListener = useRef<Notifications.Subscription>();

  // Hydrate auth and notifications from storage
  useHydration();

  // Auto-register push notifications on login
  usePushNotifications();

  // Auto-sync data via WebSocket and app foreground (requires QueryClient)
  useRealtimeSync();

  useEffect(() => {
    // Listen for notifications received while app is in foreground
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
    };
  }, []);

  return (
    <>
      <NotificationListener />
      <RootNavigator />
    </>
  );
};

// Theme wrapper component that uses Redux
const ThemedApp: React.FC = () => {
  const themePreference = useAppSelector((state) => state.ui.themePreference);

  const overrideSystem = themePreference !== 'system';
  const preferredMode = overrideSystem ? (themePreference as 'light' | 'dark') : undefined;

  return (
    <ThemeProvider mode={preferredMode} overrideSystem={overrideSystem}>
      <StatusBar style={preferredMode === 'dark' ? 'light' : 'dark'} />
      <AppContent />
    </ThemeProvider>
  );
};

const App: React.FC = () => {
  return (
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <QueryClientProvider client={queryClient}>
              <ThemedApp />
            </QueryClientProvider>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </PersistGate>
    </ReduxProvider>
  );
};

export default App;
