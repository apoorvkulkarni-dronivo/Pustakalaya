import { useState } from 'react';
import type { ReactNode } from 'react';
import { useLibrary, LANGUAGES } from '../context/LibraryContext';
import type { Book } from '../types';
import { BOOK_CATEGORY_LABELS } from '../types';
import { AddBookModal } from '../modals/AddBookModal';
import { BookDetailModal } from '../modals/BookDetailModal';
import { CategoryFilterChips } from '../components/CategoryFilterChips';
import { BookThumbFallback, IcoCheck, IcoPlus, IcoSearch, IcoUser, IcoBook } from '../components/AppIcons';

export function LibraryTab() {
  const {
    books,
    filteredBooks,
    availableBooks,
    lentBooks,
    searchText,
    setSearchText,
    selectedCategories,
    toggleCategory,
    selectedLanguages,
    toggleLanguage,
    clearAllFilters,
  } = useLibrary();
  const [addOpen, setAddOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  const detailBook = detailId ? books.find((b) => b.id === detailId) ?? null : null;

  return (
    <div className="tab-page library-tab">
      <header className="page-header library-page-head">
        <div>
          <h1 className="page-heading">My Pustakalaya</h1>
        </div>
        <button
          type="button"
          className="icon-btn icon-btn--fab icon-btn--fab-text"
          onClick={() => setAddOpen(true)}
        >
          <IcoPlus aria-hidden />
          <span>Add New Book</span>
        </button>
      </header>

      <div className="stat-row">
        <StatMini title="Total books" value={books.length} tone="primary" icon={<IcoBook />} />
        <StatMini title="Available" value={availableBooks.length} tone="success" icon={<IcoCheck />} />
        <StatMini title="On loan" value={lentBooks.length} tone="warn" icon={<IcoUser />} />
      </div>

      <div className="search-row">
        <span className="search-icon" aria-hidden>
          <IcoSearch />
        </span>
        <input
          className="search-input"
          placeholder="Search by title, author, or ISBN"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        {searchText && (
          <button type="button" className="search-clear" onClick={() => setSearchText('')}>
            ×
          </button>
        )}
      </div>

      <section className="filter-section">
        <p className="filter-label">Categories</p>
        <CategoryFilterChips
          selectedCategories={selectedCategories}
          toggleCategory={toggleCategory}
          clearAllFilters={clearAllFilters}
        />
      </section>

      <section className="filter-section">
        <p className="filter-label">Languages</p>
        <div className="chip-scroll chip-scroll--h">
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              type="button"
              className={`filter-chip ${selectedLanguages.has(lang) ? 'active' : ''}`}
              onClick={() => toggleLanguage(lang)}
            >
              {lang}
            </button>
          ))}
        </div>
      </section>

      {filteredBooks.length === 0 ? (
        <div className="empty">
          <p className="empty-title">No books match</p>
          <p className="muted">
            {searchText ? 'Try adjusting search or filters.' : 'Add your first book to begin.'}
          </p>
          {!searchText && (
            <button type="button" className="btn-primary" onClick={() => setAddOpen(true)}>
              Add New Book
            </button>
          )}
        </div>
      ) : (
        <ul className="book-list">
          {filteredBooks.map((book) => (
            <li key={book.id}>
              <BookRow book={book} onOpen={() => setDetailId(book.id)} />
            </li>
          ))}
        </ul>
      )}

      <AddBookModal open={addOpen} onClose={() => setAddOpen(false)} />
      <BookDetailModal book={detailBook} onClose={() => setDetailId(null)} />
    </div>
  );
}

function StatMini({
  title,
  value,
  tone,
  icon,
}: {
  title: string;
  value: number;
  tone: 'primary' | 'success' | 'warn';
  icon: ReactNode;
}) {
  return (
    <div className={`stat-mini stat-mini--${tone}`}>
      <span className="stat-mini-ico" aria-hidden>
        {icon}
      </span>
      <span className="stat-mini-val">{value}</span>
      <span className="stat-mini-title">{title}</span>
    </div>
  );
}

function BookRow({ book, onOpen }: { book: Book; onOpen: () => void }) {
  const cats = book.categories;
  const single = cats.length === 1;
  return (
    <button type="button" className="book-row" onClick={onOpen}>
      <div className="book-thumb book-thumb--lg">
        {book.coverImageUrl ? (
          <img src={book.coverImageUrl} alt="" />
        ) : (
          <BookThumbFallback />
        )}
      </div>
      <div className="book-row-main">
        <div className="book-row-title">{book.title}</div>
        <div className="book-row-author muted">{book.author}</div>
        <div className="book-row-meta">
          {single ? (
            <span className="book-row-cat-pill">{BOOK_CATEGORY_LABELS[cats[0]]}</span>
          ) : (
            <span className="book-row-cats book-row-cats--text">
              {cats.slice(0, 2).map((c) => (
                <span key={c} className="book-row-cat-pill book-row-cat-pill--compact">
                  {BOOK_CATEGORY_LABELS[c]}
                </span>
              ))}
              {cats.length > 2 && <span className="muted small">+{cats.length - 2}</span>}
            </span>
          )}
          {book.isLent && <span className="lent-badge">On loan</span>}
          <span className="muted book-row-pages">
            {book.numberOfPages} pp · {book.language}
          </span>
        </div>
      </div>
      <span className="chev" aria-hidden>
        ›
      </span>
    </button>
  );
}
