import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

import { sleep } from '@/utils/sleep';

const TOKEN_KEY = 'dropmate_auth_token_v1';

export type SignInPayload = {
  email: string;
  password: string;
};

export type AuthStatus = 'idle' | 'loading' | 'authenticated';

type AuthState = {
  token: string | null;
  status: AuthStatus;
  error?: string;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  signIn: (payload: SignInPayload) => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuth = create<AuthState>((set, get) => ({
  token: null,
  status: 'idle',
  error: undefined,
  hydrated: false,
  hydrate: async () => {
    if (get().hydrated) {
      return;
    }

    const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
    set({
      token: storedToken ?? null,
      status: storedToken ? 'authenticated' : 'idle',
      hydrated: true,
    });
  },
  signIn: async ({ email, password }) => {
    set({ status: 'loading', error: undefined });
    await sleep(400);

    const isValid = Boolean(email.trim()) && Boolean(password.trim());

    if (!isValid) {
      set({ status: 'idle', error: 'Please enter valid credentials.' });
      return;
    }

    const token = `mock-token-${Date.now()}`;
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    set({ token, status: 'authenticated', error: undefined });
  },
  signOut: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    set({ token: null, status: 'idle' });
  },
}));
