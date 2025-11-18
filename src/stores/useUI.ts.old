import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import { Shipment } from '@/types';

export type FilterPreset = 'ALL' | Shipment['status'] | 'TODAY' | 'WEEK';
export type ThemePreference = 'system' | 'light' | 'dark';

type PersistedUIState = {
  onboardingComplete: boolean;
  themePreference: ThemePreference;
};

type UIState = PersistedUIState & {
  hydrated: boolean;
  activeFilter: FilterPreset;
  setActiveFilter: (filter: FilterPreset) => void;
  hydrate: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  setThemePreference: (preference: ThemePreference) => Promise<void>;
};

const STORAGE_KEY = '@dropmate/ui-state/v1';

const defaultState: PersistedUIState = {
  onboardingComplete: false,
  themePreference: 'system',
};

export const useUI = create<UIState>((set, get) => ({
  ...defaultState,
  hydrated: false,
  activeFilter: 'ALL',
  setActiveFilter: (filter) => set({ activeFilter: filter }),
  hydrate: async () => {
    if (get().hydrated) {
      return;
    }

    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      set({ ...defaultState, hydrated: true });
      return;
    }

    try {
      const parsed = JSON.parse(raw) as PersistedUIState;
      set({ ...parsed, hydrated: true });
    } catch (_error) {
      set({ ...defaultState, hydrated: true });
    }
  },
  completeOnboarding: async () => {
    set({ onboardingComplete: true });
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        onboardingComplete: true,
        themePreference: get().themePreference,
      }),
    );
  },
  setThemePreference: async (preference) => {
    set({ themePreference: preference });
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        onboardingComplete: get().onboardingComplete,
        themePreference: preference,
      }),
    );
  },
}));
