import { initializeApp, FirebaseApp, getApp } from 'firebase/app';
import { initializeAuth, getAuth, Auth } from 'firebase/auth';
// @ts-ignore - getReactNativePersistence exists in @firebase/auth but not in types
import { getReactNativePersistence } from '@firebase/auth/dist/rn/index.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDhVe6Q8aJyK0vAWMJsrPIECw7hQZiVD5o',
  authDomain: 'dropmate-9dc10.firebaseapp.com',
  projectId: 'dropmate-9dc10',
  storageBucket: 'dropmate-9dc10.firebasestorage.app',
  messagingSenderId: '765867938215',
  appId: '1:765867938215:web:f63457ca27261641a6e682',
  measurementId: 'G-4ELJ8G7W46',
};

// Initialize Firebase app
let app: FirebaseApp;
let auth: Auth;

try {
  // Try to get existing app first
  app = getApp();
  // Try to get existing auth instance
  auth = getAuth(app);
} catch {
  // If no app exists, initialize one
  app = initializeApp(firebaseConfig);

  // Initialize Auth with React Native AsyncStorage persistence
  // This ensures auth state persists across app restarts
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

export { app, auth };
export default app;
