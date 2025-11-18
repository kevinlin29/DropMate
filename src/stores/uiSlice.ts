import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Shipment } from '@/types';

export type FilterPreset = 'ALL' | Shipment['status'] | 'TODAY' | 'WEEK';
export type ThemePreference = 'system' | 'light' | 'dark';

type PersistedUIState = {
  onboardingComplete: boolean;
  themePreference: ThemePreference;
};

export type UIState = PersistedUIState & {
  hydrated: boolean;
  activeFilter: FilterPreset;
};

const STORAGE_KEY = '@dropmate/ui-state/v1';

const defaultPersistedState: PersistedUIState = {
  onboardingComplete: false,
  themePreference: 'system',
};

const initialState: UIState = {
  ...defaultPersistedState,
  hydrated: false,
  activeFilter: 'ALL',
};

// Async thunks
export const hydrateUI = createAsyncThunk('ui/hydrate', async () => {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return defaultPersistedState;
  }

  try {
    const parsed = JSON.parse(raw) as PersistedUIState;
    return parsed;
  } catch (_error) {
    return defaultPersistedState;
  }
});

export const completeOnboarding = createAsyncThunk(
  'ui/completeOnboarding',
  async (_, { getState }) => {
    const state = getState() as { ui: UIState };
    const newState = {
      onboardingComplete: true,
      themePreference: state.ui.themePreference,
    };
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    return newState;
  }
);

export const setThemePreference = createAsyncThunk(
  'ui/setThemePreference',
  async (preference: ThemePreference, { getState }) => {
    const state = getState() as { ui: UIState };
    const newState = {
      onboardingComplete: state.ui.onboardingComplete,
      themePreference: preference,
    };
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    return newState;
  }
);

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveFilter: (state, action: PayloadAction<FilterPreset>) => {
      state.activeFilter = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(hydrateUI.fulfilled, (state, action) => {
        state.onboardingComplete = action.payload.onboardingComplete;
        state.themePreference = action.payload.themePreference;
        state.hydrated = true;
      })
      .addCase(completeOnboarding.fulfilled, (state, action) => {
        state.onboardingComplete = action.payload.onboardingComplete;
        state.themePreference = action.payload.themePreference;
      })
      .addCase(setThemePreference.fulfilled, (state, action) => {
        state.onboardingComplete = action.payload.onboardingComplete;
        state.themePreference = action.payload.themePreference;
      });
  },
});