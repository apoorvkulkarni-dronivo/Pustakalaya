import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported as analyticsIsSupported } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

function viteEnv(name: string): string | undefined {
  const raw = import.meta.env[name];
  if (typeof raw !== 'string') return undefined;
  const t = raw.trim();
  return t.length > 0 ? t : undefined;
}

const measurementId = viteEnv('VITE_FIREBASE_MEASUREMENT_ID');

const config = {
  apiKey: viteEnv('VITE_FIREBASE_API_KEY'),
  authDomain: viteEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: viteEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: viteEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: viteEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: viteEnv('VITE_FIREBASE_APP_ID'),
  ...(measurementId ? { measurementId } : {}),
};

export function isFirebaseConfigured(): boolean {
  return Boolean(
    config.apiKey &&
      config.authDomain &&
      config.projectId &&
      config.storageBucket &&
      config.messagingSenderId &&
      config.appId
  );
}

let app: FirebaseApp | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase is not configured. Add VITE_FIREBASE_* variables to .env');
  }
  if (!app) {
    app = initializeApp(config);
  }
  return app;
}

export function getFirebaseAuth() {
  return getAuth(getFirebaseApp());
}

export function getFirebaseDb() {
  return getFirestore(getFirebaseApp());
}

export function getFirebaseStorage() {
  // Uses `storageBucket` from the same config passed to initializeApp()
  return getStorage(getFirebaseApp());
}

/** Best-effort Analytics init (browser only; no-op if unsupported or no measurement ID). */
export async function initFirebaseAnalytics(): Promise<void> {
  if (!isFirebaseConfigured() || !measurementId) return;
  try {
    if (await analyticsIsSupported()) {
      getAnalytics(getFirebaseApp());
    }
  } catch {
    // ignore (e.g. blocked trackers, SSR)
  }
}
