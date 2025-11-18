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

interface AuthState {
  user: User | null;
  token: string | null;
  status: AuthStatus;
  error?: string;
  hydrated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  status: 'idle',
  error: undefined,
  hydrated: false,
};

// Async thunks
export const signIn = createAsyncThunk(
  'auth/signIn',
  async (payload: SignInPayload, { rejectWithValue }) => {
    try {
      const userCredential: UserCredential = await signInWithEmailAndPassword(
        auth,
        payload.email,
        payload.password
      );
      const token = await userCredential.user.getIdToken();
      await SecureStore.setItemAsync(TOKEN_KEY, token);

      return {
        user: userCredential.user.toJSON(),
        token,
      };
    } catch (error) {
      const errorMessage = getFirebaseErrorMessage(error);
      return rejectWithValue(errorMessage);
    }
  }
);

export const signUp = createAsyncThunk(
  'auth/signUp',
  async (payload: SignUpPayload, { rejectWithValue }) => {
    try {
      const userCredential: UserCredential = await createUserWithEmailAndPassword(
        auth,
        payload.email,
        payload.password
      );

      // Update display name if provided
      if (payload.displayName) {
        await firebaseUpdateProfile(userCredential.user, { displayName: payload.displayName });
      }

      const token = await userCredential.user.getIdToken();
      await SecureStore.setItemAsync(TOKEN_KEY, token);

      return {
        user: userCredential.user.toJSON(),
        token,
      };
    } catch (error) {
      const errorMessage = getFirebaseErrorMessage(error);
      return rejectWithValue(errorMessage);
    }
  }
);

export const signInWithApple = createAsyncThunk(
  'auth/signInWithApple',
  async (_, { rejectWithValue }) => {
    try {
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
        user: userCredential.user.toJSON(),
        token,
      };
    } catch (error: any) {
      // Handle Apple-specific cancellation
      if (error.code === 'ERR_REQUEST_CANCELED') {
        return rejectWithValue('Sign in was cancelled.');
      }

      const errorMessage = getFirebaseErrorMessage(error);
      return rejectWithValue(errorMessage);
    }
  }
);

export const signOutThunk = createAsyncThunk(
  'auth/signOut',
  async (_, { rejectWithValue }) => {
    try {
      await firebaseSignOut(auth);
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      return null;
    } catch (error) {
      const errorMessage = getFirebaseErrorMessage(error);
      return rejectWithValue(errorMessage);
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (email: string, { rejectWithValue }) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return null;
    } catch (error) {
      const errorMessage = getFirebaseErrorMessage(error);
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (displayName: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const user = state.auth.user;

      if (!user || !auth.currentUser) {
        throw new Error('No user is currently signed in');
      }

      await firebaseUpdateProfile(auth.currentUser, { displayName });

      return {
        ...user,
        displayName,
      };
    } catch (error) {
      const errorMessage = getFirebaseErrorMessage(error);
      return rejectWithValue(errorMessage);
    }
  }
);

export const getIdToken = createAsyncThunk(
  'auth/getIdToken',
  async (forceRefresh: boolean = true, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      if (!state.auth.user || !auth.currentUser) {
        return null;
      }

      const token = await auth.currentUser.getIdToken(forceRefresh);
      return token;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return rejectWithValue('Failed to refresh token');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ user: any; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.status = 'authenticated';
      state.error = undefined;
    },
    clearUser: (state) => {
      state.user = null;
      state.token = null;
      state.status = 'idle';
      state.error = undefined;
    },
    setHydrated: (state, action: PayloadAction<boolean>) => {
      state.hydrated = action.payload;
    },
    clearError: (state) => {
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    // Sign In
    builder
      .addCase(signIn.pending, (state) => {
        state.status = 'loading';
        state.error = undefined;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.user = action.payload.user as any;
        state.token = action.payload.token;
        state.status = 'authenticated';
        state.error = undefined;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.status = 'idle';
        state.error = action.payload as string;
      });

    // Sign Up
    builder
      .addCase(signUp.pending, (state) => {
        state.status = 'loading';
        state.error = undefined;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.user = action.payload.user as any;
        state.token = action.payload.token;
        state.status = 'authenticated';
        state.error = undefined;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.status = 'idle';
        state.error = action.payload as string;
      });

    // Sign In with Apple
    builder
      .addCase(signInWithApple.pending, (state) => {
        state.status = 'loading';
        state.error = undefined;
      })
      .addCase(signInWithApple.fulfilled, (state, action) => {
        state.user = action.payload.user as any;
        state.token = action.payload.token;
        state.status = 'authenticated';
        state.error = undefined;
      })
      .addCase(signInWithApple.rejected, (state, action) => {
        state.status = 'idle';
        state.error = action.payload as string;
      });

    // Sign Out
    builder
      .addCase(signOutThunk.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.status = 'idle';
        state.error = undefined;
      })
      .addCase(signOutThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Update Profile
    builder
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload as any;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Get ID Token
    builder.addCase(getIdToken.fulfilled, (state, action) => {
      if (action.payload) {
        state.token = action.payload;
      }
    });
  },
});

export const { setUser, clearUser, setHydrated, clearError } = authSlice.actions;
export default authSlice.reducer;

// Initialize Firebase auth listener (to be called in store setup)
export const initializeAuthListener = (dispatch: any) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      // User is signed in
      try {
        const token = await user.getIdToken();
        await SecureStore.setItemAsync(TOKEN_KEY, token);
        dispatch(setUser({ user: user.toJSON(), token }));
      } catch (error) {
        console.error('Error getting ID token:', error);
        dispatch(setUser({ user: user.toJSON(), token: '' }));
      }
    } else {
      // User is signed out
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      dispatch(clearUser());
    }
    dispatch(setHydrated(true));
  });
};
