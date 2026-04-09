import { APP_DISPLAY_NAME } from '../appMeta';
import { BrandLogo } from './BrandLogo';

function isGitHubPagesHost(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.hostname.endsWith('.github.io');
}

export function SetupRequired() {
  const onGitHubPages = isGitHubPagesHost();

  return (
    <div className="setup-screen">
      <div className="setup-card">
        <header className="setup-card-head">
          <BrandLogo className="setup-brand-logo" decorative />
          <h1 className="setup-card-title setup-card-title--after-logo">{APP_DISPLAY_NAME}</h1>
        </header>
        <p className="setup-lead">
          Connect Firebase to sync your library across devices.
          {onGitHubPages ? (
            <>
              {' '}
              This site was built on <strong>GitHub Actions</strong> — add Firebase values as{' '}
              <strong>repository secrets</strong> (same names as below), then re-run the{' '}
              <strong>Deploy to GitHub Pages</strong> workflow.
            </>
          ) : (
            <>
              {' '}
              Add these variables to <code>.env</code> in the project root:
            </>
          )}
        </p>
        <pre className="setup-pre">
          {`VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=`}
        </pre>
        {onGitHubPages && (
          <p className="setup-hint setup-hint--pages">
            GitHub: <strong>Settings → Secrets and variables → Actions → New repository secret</strong>.
            Use each line above as the secret <em>name</em> (underscores, no spaces). Then{' '}
            <strong>Actions → Deploy to GitHub Pages → Re-run all jobs</strong>. In Firebase, add{' '}
            <strong>ak-apoorvkulkarni.github.io</strong> under Authentication → Settings → Authorized
            domains.
          </p>
        )}
        <div className="setup-hint">
          <p>
            In the Firebase console: enable <strong>Authentication</strong> (Google sign-in),{' '}
            <strong>Firestore</strong>, and <strong>Storage</strong>.
          </p>
          <p>
            Deploy <code>firestore.rules</code> and <code>storage.rules</code> (e.g.{' '}
            <code>firebase deploy --only firestore:rules,storage</code> — see README).
          </p>
          {!onGitHubPages && (
            <p>
              Restart the dev server after editing <code>.env</code>.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
