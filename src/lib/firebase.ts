import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

/**
 * Chat backend config. Copy .env.example to .env and fill in your Firebase web-app values.
 * (EXPO_PUBLIC_* variables are inlined at build time. Firebase web keys are not secrets;
 * access is enforced by firestore.rules.)
 */
const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const chatConfigured = Boolean(config.apiKey && config.projectId && config.appId);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

export function getFirebase(): { auth: Auth; db: Firestore } | null {
  if (!chatConfigured) return null;
  if (!app) {
    app = getApps().length ? getApp() : initializeApp(config);
    auth =
      Platform.OS === 'web'
        ? getAuth(app)
        : (() => {
            try {
              return initializeAuth(app!, { persistence: getReactNativePersistence(AsyncStorage) });
            } catch {
              return getAuth(app!); // already initialised (fast refresh)
            }
          })();
    db = getFirestore(app);
  }
  return { auth: auth!, db: db! };
}
