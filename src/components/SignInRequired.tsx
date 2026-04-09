import { useState } from 'react';
import { APP_DISPLAY_NAME } from '../appMeta';
import { BrandLogo } from './BrandLogo';
import { useLibrary } from '../context/LibraryContext';

function IconBook() {
  return (
    <svg className="landing-svg-ico" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconLend() {
  return (
    <svg className="landing-svg-ico" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconHeart() {
  return (
    <svg className="landing-svg-ico" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconChart() {
  return (
    <svg className="landing-svg-ico" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M18 20V10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M12 20V4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M6 20v-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function IconGoogle() {
  return (
    <svg className="landing-google-g" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

const FEATURES = [
  {
    Icon: IconBook,
    title: 'Your shelf, remembered',
    text:
      'Catalogue every book you own—titles, covers, languages, and categories—so nothing lives only in memory.',
  },
  {
    Icon: IconLend,
    title: 'Lending, without guesswork',
    text:
      'See who has what, when it went out, and when it came home—without chasing messages across threads.',
  },
  {
    Icon: IconHeart,
    title: 'Wishlist & next reads',
    text:
      'Keep the books you want in one ordered list, ready to promote to your shelf when you add them.',
  },
  {
    Icon: IconChart,
    title: 'Insight at a glance',
    text:
      'Filters and statistics summarize your collection by language, category, and what is currently on loan.',
  },
] as const;

export function SignInRequired() {
  const { signInWithGoogle } = useLibrary();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSignIn = async () => {
    setError(null);
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      const code = e && typeof e === 'object' && 'code' in e ? String((e as { code: string }).code) : '';
      if (code === 'auth/popup-closed-by-user') {
        setError('Sign-in was cancelled.');
      } else if (code === 'auth/popup-blocked') {
        setError('Pop-up was blocked. Allow pop-ups for this site and try again.');
      } else if (code === 'auth/unauthorized-domain') {
        setError('This site’s domain is not allowed for sign-in. Ask the person who runs the app to update hosting settings.');
      } else {
        setError(e instanceof Error ? e.message : 'Sign-in failed. Try again.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="landing">
      <div className="landing-bg" aria-hidden />
      <div className="landing-inner">
        <section className="landing-hero" aria-labelledby="landing-title">
          <div className="landing-hero-accent" aria-hidden />
          <BrandLogo className="landing-logo" />
          <h1 id="landing-title" className="landing-title">
            {APP_DISPLAY_NAME}
          </h1>
          <p className="landing-tagline">
            A quiet, precise home for the books you own—and for every copy you trust someone else to
            hold for a while.
          </p>
          <p className="landing-sub">
            Pustakalaya is a web library manager: an accurate catalogue, lending history with dates
            and contacts, wishlists, and simple statistics—so your collection stays{' '}
            <span className="landing-sub-strong">accountable and yours</span>, even when volumes are
            away from your shelf.
          </p>

          <div className="landing-section-head">
            <h2 className="landing-section-label">Capabilities</h2>
            <p className="landing-section-desc">Everything in one signed-in workspace</p>
          </div>

          <ul className="landing-features" aria-label="Product capabilities">
            {FEATURES.map(({ Icon, title, text }) => (
              <li key={title} className="landing-feature">
                <div className="landing-feature-icon-wrap">
                  <Icon />
                </div>
                <div className="landing-feature-body">
                  <h3 className="landing-feature-title">{title}</h3>
                  <p className="landing-feature-text">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <aside className="landing-aside">
          <div className="landing-cta theme-card">
            <BrandLogo className="landing-cta-logo" decorative />
            <div className="landing-cta-badge">Secure access</div>
            <h2 className="landing-cta-title">Sign in to continue</h2>
            <p className="landing-cta-lead">
              Use your Google account. Your library is private to you and only loads when you are
              signed in—nothing is shown to other visitors of this site.
            </p>
            <div className="landing-cta-actions">
              <button
                type="button"
                className="landing-btn-google"
                onClick={() => void onSignIn()}
                disabled={busy}
              >
                <IconGoogle />
                <span>{busy ? 'Signing in…' : 'Continue with Google'}</span>
              </button>
              {error ? (
                <p className="landing-cta-error" role="alert">
                  {error}
                </p>
              ) : null}
            </div>
            <p className="landing-cta-foot">Encrypted session · Sync across browsers when signed in</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
