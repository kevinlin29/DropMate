import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { RootNavigator } from '@/navigation/RootNavigator';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { useUI } from '@/stores/useUI';

const queryClient = new QueryClient();

const App: React.FC = () => {
  const themePreference = useUI((state) => state.themePreference);

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

export default App;
