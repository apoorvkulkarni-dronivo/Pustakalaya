import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { useLibrary } from '../context/LibraryContext';
import { BOOK_CATEGORY_LABELS, BOOK_CATEGORY_ORDER } from '../types';
import { BookThumbFallback, IcoBook, IcoCheck, IcoTag, IcoUser } from '../components/AppIcons';

const LANG_STATS = ['English', 'Marathi', 'Hindi', 'German'];

export function StatsTab() {
  const { books, availableBooks, lentBooks } = useLibrary();

  const categoryCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const b of books) {
      for (const c of b.categories) {
        m.set(c, (m.get(c) ?? 0) + 1);
      }
    }
    return m;
  }, [books]);

  const recent = useMemo(
    () => [...books].sort((a, b) => b.dateAdded.getTime() - a.dateAdded.getTime()).slice(0, 5),
    [books]
  );

  const uniqueCats = useMemo(() => new Set(books.flatMap((b) => b.categories)).size, [books]);

  return (
    <div className="tab-page stats-page">
      <header className="page-header">
        <h1 className="page-heading">Statistics</h1>
      </header>

      <h2 className="section-title">Overview</h2>
      <div className="stats-grid stats-grid--4">
        <StatCard title="Total books" value={books.length} tone="primary" icon={<IcoBook />} />
        <StatCard title="Available" value={availableBooks.length} tone="success" icon={<IcoCheck />} />
        <StatCard title="On loan" value={lentBooks.length} tone="warn" icon={<IcoUser />} />
        <StatCard title="Categories used" value={uniqueCats} tone="neutral" icon={<IcoTag />} />
      </div>

      <h2 className="section-title">By category</h2>
      <div className="stat-list">
        {BOOK_CATEGORY_ORDER.map((c) => {
          const count = categoryCounts.get(c) ?? 0;
          if (count === 0) return null;
          const pct = books.length ? Math.round((count / books.length) * 100) : 0;
          return (
            <div key={c} className="stat-row-bar">
              <span className="stat-row-label">{BOOK_CATEGORY_LABELS[c]}</span>
              <div className="stat-row-mid">
                <span className="stat-row-count muted">
                  {count} book{count === 1 ? '' : 's'}
                </span>
                <div className="bar-track">
                  <div className="bar-fill bar-fill--primary" style={{ width: `${pct}%` }} />
                </div>
              </div>
              <span className="stat-row-pct muted">{pct}%</span>
            </div>
          );
        })}
      </div>

      <h2 className="section-title">By language</h2>
      <div className="stat-list">
        {LANG_STATS.map((lang) => {
          const count = books.filter((b) => b.language === lang).length;
          if (count === 0) return null;
          const pct = books.length ? Math.round((count / books.length) * 100) : 0;
          return (
            <div key={lang} className="stat-row-bar">
              <span className="stat-row-label">{lang}</span>
              <div className="stat-row-mid">
                <span className="stat-row-count muted">
                  {count} book{count === 1 ? '' : 's'}
                </span>
                <div className="bar-track">
                  <div className="bar-fill bar-fill--primary" style={{ width: `${pct}%` }} />
                </div>
              </div>
              <span className="stat-row-pct muted">{pct}%</span>
            </div>
          );
        })}
      </div>

      <h2 className="section-title">Recently added</h2>
      <ul className="recent-list">
        {recent.map((b) => (
          <li key={b.id} className="recent-row">
            <div className="book-thumb tiny">
              {b.coverImageUrl ? <img src={b.coverImageUrl} alt="" /> : <BookThumbFallback width={22} height={22} />}
            </div>
            <div>
              <div className="book-row-title">{b.title}</div>
              <div className="muted small">Added {fmtRelative(b.dateAdded)}</div>
            </div>
            {b.isLent && <span className="lent-badge">On loan</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function fmtRelative(d: Date) {
  const now = new Date();
  const days = Math.floor((now.getTime() - d.getTime()) / (86400 * 1000));
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  return d.toLocaleDateString(undefined, { dateStyle: 'short' });
}

function StatCard({
  title,
  value,
  icon,
  tone,
}: {
  title: string;
  value: number;
  icon: ReactNode;
  tone: 'primary' | 'success' | 'warn' | 'neutral';
}) {
  return (
    <div className={`stat-card stat-card--tone-${tone}`}>
      <span className="stat-card-ico" aria-hidden>
        {icon}
      </span>
      <span className="stat-card-val">{value}</span>
      <span className="stat-card-title">{title}</span>
    </div>
  );
}
