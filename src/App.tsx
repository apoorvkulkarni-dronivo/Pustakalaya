import type { ComponentType } from 'react';
import { useState } from 'react';
import { LibraryProvider, useLibrary } from './context/LibraryContext';
import { SetupRequired } from './components/SetupRequired';
import { SignInRequired } from './components/SignInRequired';
import { FirebaseBootstrapError } from './components/FirebaseBootstrapError';
import {
  IcoNavLibrary,
  IcoNavLent,
  IcoNavSettings,
  IcoNavStats,
  IcoNavWishlist,
} from './components/AppIcons';
import { APP_DISPLAY_NAME, APP_NAME_LATIN } from './appMeta';
import { DEV_SKIP_AUTH } from './devFlags';
import { BrandLogo } from './components/BrandLogo';
import type { TabId } from './types';
import { LibraryTab } from './views/LibraryTab';
import { WishlistTab } from './views/WishlistTab';
import { LentTab } from './views/LentTab';
import { StatsTab } from './views/StatsTab';
import { SettingsTab } from './views/SettingsTab';

const TABS: { id: TabId; label: string; Icon: ComponentType<{ className?: string }> }[] = [
  { id: 'library', label: 'Library', Icon: IcoNavLibrary },
  { id: 'wishlist', label: 'Wishlist', Icon: IcoNavWishlist },
  { id: 'lent', label: 'Lent out', Icon: IcoNavLent },
  { id: 'stats', label: 'Statistics', Icon: IcoNavStats },
  { id: 'settings', label: 'Settings', Icon: IcoNavSettings },
];

function AppShell() {
  const { ready, firebaseOk, firebaseBootstrapError, user } = useLibrary();
  const [tab, setTab] = useState<TabId>('library');

  if (!ready) {
    return (
      <div className="app-loading">
        <div className="loading-spinner" aria-hidden />
        <p>Loading {APP_NAME_LATIN}…</p>
      </div>
    );
  }

  if (!firebaseOk) {
    return <SetupRequired />;
  }

  if (firebaseBootstrapError) {
    return <FirebaseBootstrapError message={firebaseBootstrapError} />;
  }

  if (!user && !DEV_SKIP_AUTH) {
    return <SignInRequired />;
  }

  return (
    <div className="app">
      {DEV_SKIP_AUTH && (
        <div className="dev-auth-banner" role="status">
          Dev: sign-in is skipped. Data stays empty until you sign in in Settings or set{' '}
          <code>VITE_DEV_SKIP_AUTH=false</code> in <code>.env.development</code>.
        </div>
      )}
      <header className="app-brand app-brand-bar">
        <h1 className="app-brand-heading">
          <BrandLogo className="app-brand-logo" decorative />
          <span className="sr-only">{APP_DISPLAY_NAME}</span>
        </h1>
      </header>

      <nav className="app-nav" aria-label="Main">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            className={`nav-tab ${tab === id ? 'active' : ''}`}
            onClick={() => setTab(id)}
          >
            <Icon className="nav-svg" />
            <span className="nav-lbl">{label}</span>
          </button>
        ))}
      </nav>

      <main className="app-main">
        {tab === 'library' && <LibraryTab />}
        {tab === 'wishlist' && <WishlistTab />}
        {tab === 'lent' && <LentTab />}
        {tab === 'stats' && <StatsTab />}
        {tab === 'settings' && <SettingsTab />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <LibraryProvider>
      <AppShell />
    </LibraryProvider>
  );
}
