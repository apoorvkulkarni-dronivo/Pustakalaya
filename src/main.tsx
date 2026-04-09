import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './appShell.css';
import App from './App.tsx';
import { initFirebaseAnalytics, isFirebaseConfigured } from './lib/firebase';

if (isFirebaseConfigured()) {
  void initFirebaseAnalytics();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
