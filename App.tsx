import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { RootNavigator } from '@/navigation/RootNavigator';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { store, persistor } from '@/stores';
import { useAppSelector } from '@/stores/hooks';

const queryClient = new QueryClient();

const AppContent: React.FC = () => {
  const themePreference = useAppSelector((state) => state.ui.themePreference);

  const overrideSystem = themePreference !== 'system';
  const preferredMode = overrideSystem ? (themePreference as 'light' | 'dark') : undefined;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider mode={preferredMode} overrideSystem={overrideSystem}>
            <StatusBar style={preferredMode === 'dark' ? 'light' : 'dark'} />
            <RootNavigator />
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppContent />
      </PersistGate>
    </Provider>
  );
};

export default App;
