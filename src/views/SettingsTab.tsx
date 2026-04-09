import { useState } from 'react';
import { APP_DISPLAY_NAME, APP_NAME_LATIN } from '../appMeta';
import { DEV_SKIP_AUTH } from '../devFlags';
import { useLibrary } from '../context/LibraryContext';
import { BrandLogo } from '../components/BrandLogo';
import {
  IcoCalendar,
  IcoGlobe,
  IcoHash,
  IcoMail,
  IcoMonitor,
  IcoSmartphone,
  IcoUser,
} from '../components/AppIcons';

export function SettingsTab() {
  const { user, books, wishlistItems, lentBooks, clearAllData, addSampleData, signOutUser } =
    useLibrary();
  const [clearStep, setClearStep] = useState<0 | 1 | 2>(0);

  const runClear = async () => {
    await clearAllData();
    setClearStep(0);
  };

  return (
    <div className="tab-page settings-page">
      <header className="page-header">
        <h1>Settings</h1>
      </header>

      <div className="settings-hero">
        <div className="settings-logo-wrap">
          <BrandLogo className="settings-brand-logo" decorative />
        </div>
        <h2>{APP_DISPLAY_NAME}</h2>
        <p className="muted">Your personal book management app</p>
      </div>

      <section className="settings-block">
        <h3>Account</h3>
        <div className="settings-rows">
          <div className="settings-row">
            <span className="settings-row-ico" aria-hidden>
              <IcoMail />
            </span>
            <div>
              <div className="settings-row-label">Signed in as</div>
              <div>
                {!user && DEV_SKIP_AUTH
                  ? 'Not signed in (dev preview)'
                  : (user?.email ?? user?.uid ?? '—')}
              </div>
            </div>
          </div>
        </div>
        <button type="button" className="btn-secondary full" onClick={() => void signOutUser()}>
          Sign out
        </button>
      </section>

      <section className="settings-block">
        <h3>Developer information</h3>
        <div className="settings-rows">
          <div className="settings-row">
            <span className="settings-row-ico" aria-hidden>
              <IcoUser />
            </span>
            <div>
              <div className="settings-row-label">Developer</div>
              <div>Apoorv Kulkarni</div>
            </div>
          </div>
          <a
            className="settings-row settings-row--link"
            href="https://ak-apoorvkulkarni.github.io/"
            target="_blank"
            rel="noreferrer"
          >
            <span className="settings-row-ico" aria-hidden>
              <IcoGlobe />
            </span>
            <div>
              <div className="settings-row-label">Portfolio</div>
              <div className="link-accent">ak-apoorvkulkarni.github.io</div>
            </div>
          </a>
        </div>
      </section>

      <section className="settings-block">
        <h3>App information</h3>
        <div className="settings-rows">
          <div className="settings-row">
            <span className="settings-row-ico" aria-hidden>
              <IcoSmartphone />
            </span>
            <div>
              <div className="settings-row-label">App name</div>
              <div>{APP_NAME_LATIN}</div>
            </div>
          </div>
          <div className="settings-row">
            <span className="settings-row-ico" aria-hidden>
              <IcoHash />
            </span>
            <div>
              <div className="settings-row-label">Version</div>
              <div>1.0.0</div>
            </div>
          </div>
          <div className="settings-row">
            <span className="settings-row-ico" aria-hidden>
              <IcoCalendar />
            </span>
            <div>
              <div className="settings-row-label">Release</div>
              <div>April 2026</div>
            </div>
          </div>
          <div className="settings-row">
            <span className="settings-row-ico" aria-hidden>
              <IcoMonitor />
            </span>
            <div>
              <div className="settings-row-label">Platform</div>
              <div>Web (desktop & mobile browsers)</div>
            </div>
          </div>
        </div>
      </section>

      <section className="settings-block">
        <h3>Your library statistics</h3>
        <ul className="settings-stats">
          <li>
            <strong>{books.length}</strong> total books
          </li>
          <li>
            <strong>{wishlistItems.length}</strong> wishlist items
          </li>
          <li>
            <strong>{lentBooks.length}</strong> books lent out
          </li>
          <li>
            <strong>{new Set(books.flatMap((b) => b.categories)).size}</strong> categories used
          </li>
        </ul>
        <button type="button" className="btn-secondary full" onClick={() => void addSampleData()}>
          Load sample books (if missing)
        </button>
      </section>

      <section className="settings-block danger-zone">
        <h3>Data management</h3>
        <p className="muted small">
          Permanently delete all books, wishlist items, and lending records stored in Firebase for
          this account.
        </p>
        <button type="button" className="btn-danger full" onClick={() => setClearStep(1)}>
          Clear all data
        </button>
      </section>

      {clearStep === 1 && (
        <div className="modal-backdrop sub">
          <div className="modal tiny">
            <p>
              This will permanently delete all your books, wishlist items, and lending records. This
              action cannot be undone.
            </p>
            <div className="row gap">
              <button type="button" className="btn-secondary" onClick={() => setClearStep(0)}>
                Cancel
              </button>
              <button type="button" className="btn-danger" onClick={() => setClearStep(2)}>
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {clearStep === 2 && (
        <div className="modal-backdrop sub">
          <div className="modal tiny settings-clear-final">
            <p>
              Are you absolutely sure you want to delete <strong>all</strong> data? This includes:
            </p>
            <ul className="settings-clear-list">
              <li>All books in your library</li>
              <li>All wishlist items</li>
              <li>All lending records and history</li>
            </ul>
            <p className="muted small">This cannot be undone.</p>
            <div className="row gap">
              <button type="button" className="btn-secondary" onClick={() => setClearStep(0)}>
                Cancel
              </button>
              <button type="button" className="btn-danger" onClick={() => void runClear()}>
                Delete all data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
