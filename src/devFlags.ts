/**
 * When true (dev server + VITE_DEV_SKIP_AUTH=true), the app shell renders without Google sign-in.
 * Firestore stays disconnected until you sign in, so lists stay empty—good for UI work.
 */
export const DEV_SKIP_AUTH =
  import.meta.env.DEV && import.meta.env.VITE_DEV_SKIP_AUTH === 'true';
