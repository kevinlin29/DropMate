import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Shipment } from '@/types';

export type FilterPreset = 'ALL' | Shipment['status'] | 'TODAY' | 'WEEK';
export type ThemePreference = 'system' | 'light' | 'dark';

interface UIState {
  onboardingComplete: boolean;
  themePreference: ThemePreference;
  activeFilter: FilterPreset;
  hydrated: boolean;
}

const initialState: UIState = {
  onboardingComplete: false,
  themePreference: 'system',
  activeFilter: 'ALL',
  hydrated: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveFilter: (state, action: PayloadAction<FilterPreset>) => {
      state.activeFilter = action.payload;
    },
    completeOnboarding: (state) => {
      state.onboardingComplete = true;
    },
    setThemePreference: (state, action: PayloadAction<ThemePreference>) => {
      state.themePreference = action.payload;
    },
    hydrateUI: (state, action: PayloadAction<{ onboardingComplete: boolean; themePreference: ThemePreference }>) => {
      state.onboardingComplete = action.payload.onboardingComplete;
      state.themePreference = action.payload.themePreference;
      state.hydrated = true;
    },
    setHydrated: (state, action: PayloadAction<boolean>) => {
      state.hydrated = action.payload;
    },
  },
});

export const {
  setActiveFilter,
  completeOnboarding,
  setThemePreference,
  hydrateUI,
  setHydrated,
} = uiSlice.actions;

export default uiSlice.reducer;
