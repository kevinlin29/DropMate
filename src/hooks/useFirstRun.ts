import { useMemo } from 'react';
import { useAppSelector } from '@/store/hooks';

export const useFirstRun = () => {
  const authHydrated = useAppSelector((state) => state.auth.hydrated);
  const authStatus = useAppSelector((state) => state.auth.status);
  const token = useAppSelector((state) => state.auth.token);

  const uiHydrated = useAppSelector((state) => state.ui.hydrated);
  const onboardingComplete = useAppSelector((state) => state.ui.onboardingComplete);

  // Note: Hydration is now handled in App.tsx via useHydration hook

  const isReady = authHydrated && uiHydrated;
  const isAuthenticated = authStatus === 'authenticated' && Boolean(token);
  const shouldShowTutorial = isReady && !onboardingComplete;

  const initialRoute = useMemo(() => {
    if (!isReady) {
      return 'Splash';
    }

    if (!isAuthenticated) {
      return shouldShowTutorial ? 'Tutorial' : 'Login';
    }

    return 'Main';
  }, [isAuthenticated, isReady, shouldShowTutorial]);

  return {
    isReady,
    isAuthenticated,
    shouldShowTutorial,
    initialRoute,
  } as const;
};
