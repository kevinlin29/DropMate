import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile as firebaseUpdateProfile,
  onAuthStateChanged,
  signInWithCredential,
  OAuthProvider,
  User,
  UserCredential,
} from 'firebase/auth';
import * as AppleAuthentication from 'expo-apple-authentication';

import { auth } from '@/config/firebase';
import { getFirebaseErrorMessage } from '@/utils/firebaseErrors';

const TOKEN_KEY = 'dropmate_auth_token_v1';

export type SignInPayload = {
  email: string;
  password: string;
};

export type SignUpPayload = {
  email: string;
  password: string;
  displayName?: string;
};

export type AuthStatus = 'idle' | 'loading' | 'authenticated';

type AuthState = {
  user: User | null;
  token: string | null;
  status: AuthStatus;
  error?: string;
  hydrated: boolean;
};

const initialState: AuthState = {
  user: null,
  token: null,
  status: 'idle',
  error: undefined,
  hydrated: false,
};

// Async thunks
export const hydrateAuth = createAsyncThunk(
  'auth/hydrate',
  async (_, { dispatch, getState }) => {
    const state = getState() as { auth: AuthState };
    if (state.auth.hydrated) {
      return;
    }

    return new Promise<void>((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            const token = await user.getIdToken();
            await SecureStore.setItemAsync(TOKEN_KEY, token);
            dispatch(authSlice.actions.setAuthenticatedUser({ user, token }));
          } catch (error) {
            console.error('Error getting ID token:', error);
            dispatch(authSlice.actions.setAuthenticatedUser({ user, token: null }));
          }
        } else {
          await SecureStore.deleteItemAsync(TOKEN_KEY);
          dispatch(authSlice.actions.clearAuth());
        }
        dispatch(authSlice.actions.setHydrated());
        unsubscribe();
        resolve();
      });
    });
  }
);

export const signIn = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }: SignInPayload) => {
    const userCredential: UserCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const token = await userCredential.user.getIdToken();
    await SecureStore.setItemAsync(TOKEN_KEY, token);

    return {
      user: userCredential.user,
      token,
    };
  }
);

export const signUp = createAsyncThunk(
  'auth/signUp',
  async ({ email, password, displayName }: SignUpPayload) => {
    const userCredential: UserCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    if (displayName) {
      await firebaseUpdateProfile(userCredential.user, { displayName });
    }

    const token = await userCredential.user.getIdToken();
    await SecureStore.setItemAsync(TOKEN_KEY, token);

    return {
      user: userCredential.user,
      token,
    };
  }
);

export const signInWithApple = createAsyncThunk(
  'auth/signInWithApple',
  async () => {
    // Request Apple authentication
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    // Create Firebase credential from Apple ID token
    const provider = new OAuthProvider('apple.com');
    const firebaseCredential = provider.credential({
      idToken: credential.identityToken || undefined,
      rawNonce: undefined,
    });

    // Sign in to Firebase with Apple credential
    const userCredential: UserCredential = await signInWithCredential(
      auth,
      firebaseCredential
    );

    // Update profile with Apple-provided name if available and not already set
    if (
      credential.fullName &&
      !userCredential.user.displayName &&
      (credential.fullName.givenName || credential.fullName.familyName)
    ) {
      const displayName = [
        credential.fullName.givenName,
        credential.fullName.familyName,
      ]
        .filter(Boolean)
        .join(' ');

      if (displayName) {
        await firebaseUpdateProfile(userCredential.user, { displayName });
      }
    }

    const token = await userCredential.user.getIdToken();
    await SecureStore.setItemAsync(TOKEN_KEY, token);

    return {
      user: userCredential.user,
      token,
    };
  }
);

export const signOut = createAsyncThunk('auth/signOut', async () => {
  await firebaseSignOut(auth);
  await SecureStore.deleteItemAsync(TOKEN_KEY);
});

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (displayName: string, { getState }) => {
    const state = getState() as { auth: AuthState };
    const { user } = state.auth;
    
    if (!user) {
      throw new Error('No user is currently signed in');
    }

    await firebaseUpdateProfile(user, { displayName });
    return { ...user, displayName };
  }
);

export const getIdToken = createAsyncThunk(
  'auth/getIdToken',
  async (_, { getState }) => {
    const state = getState() as { auth: AuthState };
    const { user } = state.auth;
    
    if (!user) {
      return null;
    }

    try {
      return await user.getIdToken(true);
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setHydrated: (state) => {
      state.hydrated = true;
    },
    setAuthenticatedUser: (state, action: PayloadAction<{ user: User; token: string | null }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.status = 'authenticated';
      state.error = undefined;
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.status = 'idle';
      state.error = undefined;
    },
    clearError: (state) => {
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      // Sign in
      .addCase(signIn.pending, (state) => {
        state.status = 'loading';
        state.error = undefined;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.status = 'authenticated';
        state.error = undefined;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.status = 'idle';
        state.error = getFirebaseErrorMessage(action.error);
      })
      // Sign up
      .addCase(signUp.pending, (state) => {
        state.status = 'loading';
        state.error = undefined;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.status = 'authenticated';
        state.error = undefined;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.status = 'idle';
        state.error = getFirebaseErrorMessage(action.error);
      })
      // Sign in with Apple
      .addCase(signInWithApple.pending, (state) => {
        state.status = 'loading';
        state.error = undefined;
      })
      .addCase(signInWithApple.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.status = 'authenticated';
        state.error = undefined;
      })
      .addCase(signInWithApple.rejected, (state, action) => {
        state.status = 'idle';
        if (action.error.message === 'ERR_REQUEST_CANCELED') {
          state.error = 'Sign in was cancelled.';
        } else {
          state.error = getFirebaseErrorMessage(action.error);
        }
      })
      // Sign out
      .addCase(signOut.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.status = 'idle';
        state.error = undefined;
      })
      .addCase(signOut.rejected, (state, action) => {
        state.error = getFirebaseErrorMessage(action.error);
      })
      // Reset password
      .addCase(resetPassword.rejected, (state, action) => {
        state.error = getFirebaseErrorMessage(action.error);
      })
      // Update profile
      .addCase(updateProfile.fulfilled, (state, action) => {
        if (state.user) {
          state.user = action.payload;
        }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.error = getFirebaseErrorMessage(action.error);
      });
  },
});