import { useEffect, useMemo } from 'react';

import { useAuth } from '@/stores/useAuth';
import { useUI } from '@/stores/useUI';

export const useFirstRun = () => {
  const hydrateAuth = useAuth((state) => state.hydrate);
  const authHydrated = useAuth((state) => state.hydrated);
  const authStatus = useAuth((state) => state.status);
  const token = useAuth((state) => state.token);

  const hydrateUI = useUI((state) => state.hydrate);
  const uiHydrated = useUI((state) => state.hydrated);
  const onboardingComplete = useUI((state) => state.onboardingComplete);

  useEffect(() => {
    void hydrateAuth();
    void hydrateUI();
  }, [hydrateAuth, hydrateUI]);

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
