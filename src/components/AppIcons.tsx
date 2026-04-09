import type { SVGProps } from 'react';

type IcoProps = SVGProps<SVGSVGElement>;

const s = {
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function IcoNavLibrary(props: IcoProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden {...props}>
      <path {...s} d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path {...s} d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

export function IcoNavWishlist(props: IcoProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden {...props}>
      <path
        {...s}
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      />
    </svg>
  );
}

export function IcoNavLent(props: IcoProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden {...props}>
      <path {...s} d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle {...s} cx="9" cy="7" r="4" />
      <path {...s} d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function IcoNavStats(props: IcoProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden {...props}>
      <path {...s} d="M18 20V10" />
      <path {...s} d="M12 20V4" />
      <path {...s} d="M6 20v-6" />
    </svg>
  );
}

export function IcoNavSettings(props: IcoProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden {...props}>
      <circle {...s} cx="12" cy="12" r="3" />
      <path
        {...s}
        d="M12 1v2m0 18v2M4.2 4.2l1.4 1.4m12.8 12.8 1.4 1.4M1 12h2m18 0h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"
      />
    </svg>
  );
}

export function IcoBook(props: IcoProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden {...props}>
      <path {...s} d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path {...s} d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

export function IcoCheck(props: IcoProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden {...props}>
      <path {...s} d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function IcoUser(props: IcoProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden {...props}>
      <path {...s} d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle {...s} cx="12" cy="7" r="4" />
    </svg>
  );
}

export function IcoTag(props: IcoProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden {...props}>
      <path {...s} d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
      <path d="M7 7h.01" stroke="currentColor" strokeWidth={2} strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function IcoSearch(props: IcoProps) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden {...props}>
      <circle {...s} cx="11" cy="11" r="8" />
      <path {...s} d="m21 21-4.35-4.35" />
    </svg>
  );
}

export function IcoPlus(props: IcoProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden {...props}>
      <path {...s} d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IcoFileText(props: IcoProps) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden {...props}>
      <path {...s} d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path {...s} d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  );
}

export function IcoGlobe(props: IcoProps) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden {...props}>
      <circle {...s} cx="12" cy="12" r="10" />
      <path {...s} d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

export function IcoCalendar(props: IcoProps) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden {...props}>
      <rect {...s} x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <path {...s} d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

export function IcoMail(props: IcoProps) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden {...props}>
      <path {...s} d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <path {...s} d="m22 6-10 7L2 6" />
    </svg>
  );
}

export function IcoSmartphone(props: IcoProps) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden {...props}>
      <rect {...s} x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <path {...s} d="M12 18h.01" />
    </svg>
  );
}

export function IcoHash(props: IcoProps) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden {...props}>
      <path {...s} d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18" />
    </svg>
  );
}

export function IcoMonitor(props: IcoProps) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden {...props}>
      <rect {...s} x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <path {...s} d="M8 21h8M12 17v4" />
    </svg>
  );
}

export function BookThumbFallback(props: IcoProps) {
  return (
    <span className="book-thumb-fallback-inner">
      <IcoBook width={28} height={28} {...props} />
    </span>
  );
}
