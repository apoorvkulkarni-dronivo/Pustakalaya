import { APP_DISPLAY_NAME } from '../appMeta';
import { BrandLogo } from './BrandLogo';

export function FirebaseBootstrapError({ message }: { message: string }) {
  return (
    <div className="setup-screen">
      <div className="setup-card">
        <header className="setup-card-head">
          <BrandLogo className="setup-brand-logo" decorative />
          <h1 className="setup-card-title setup-card-title--after-logo">{APP_DISPLAY_NAME}</h1>
        </header>
        <p className="setup-lead">
          Firebase could not start in the browser. Details:
        </p>
        <pre className="setup-pre bootstrap-error-pre">{message}</pre>
        <div className="setup-hint">
          <p>
            Confirm a <code>.env</code> file exists in the <strong>project root</strong> (same folder as{' '}
            <code>package.json</code>), with all <code>VITE_FIREBASE_*</code> variables set—no quotes
            around values unless they are part of the value.
          </p>
          <p>
            Stop and restart <code>npm run dev</code> after editing <code>.env</code>. Hard-refresh the
            page (or clear site cache) so an old build is not served.
          </p>
        </div>
      </div>
    </div>
  );
}
