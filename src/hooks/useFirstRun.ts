import { useEffect, useMemo } from 'react';

import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { hydrateAuth } from '@/stores/authSlice';
import { hydrateUI } from '@/stores/uiSlice';

export const useFirstRun = () => {
  const dispatch = useAppDispatch();
  const authHydrated = useAppSelector((state) => state.auth.hydrated);
  const authStatus = useAppSelector((state) => state.auth.status);
  const token = useAppSelector((state) => state.auth.token);

  const uiHydrated = useAppSelector((state) => state.ui.hydrated);
  const onboardingComplete = useAppSelector((state) => state.ui.onboardingComplete);

  useEffect(() => {
    dispatch(hydrateAuth() as any);
    dispatch(hydrateUI() as any);
  }, [dispatch]);

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
