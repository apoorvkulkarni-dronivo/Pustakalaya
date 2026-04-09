import { useMemo, useState } from 'react';
import { useLibrary } from '../context/LibraryContext';
import type { Book } from '../types';
import { BOOK_CATEGORY_LABELS, primaryCategory } from '../types';
import { BookDetailModal } from '../modals/BookDetailModal';
import { BookThumbFallback } from '../components/AppIcons';

export function LentTab() {
  const { books, lentBooks, returnBook } = useLibrary();
  const [segment, setSegment] = useState<'active' | 'history'>('active');
  const [detailId, setDetailId] = useState<string | null>(null);

  const historyBooks = useMemo(
    () =>
      [...books]
        .filter((b) => b.lendingRecord != null)
        .sort(
          (a, b) =>
            (b.lendingRecord?.dateLent.getTime() ?? 0) -
            (a.lendingRecord?.dateLent.getTime() ?? 0)
        ),
    [books]
  );

  const detailBook = detailId ? books.find((b) => b.id === detailId) ?? null : null;

  return (
    <div className="tab-page">
      <header className="page-header">
        <h1>Lent Books</h1>
      </header>

      <div className="segment">
        <button
          type="button"
          className={segment === 'active' ? 'on' : ''}
          onClick={() => setSegment('active')}
        >
          Active
        </button>
        <button
          type="button"
          className={segment === 'history' ? 'on' : ''}
          onClick={() => setSegment('history')}
        >
          History
        </button>
      </div>

      {segment === 'active' ? (
        lentBooks.length === 0 ? (
          <div className="empty">
            <p className="empty-title">No books lent out</p>
            <p className="muted">Books you lend appear here.</p>
          </div>
        ) : (
          <ul className="book-list">
            {lentBooks.map((book) => (
              <li key={book.id}>
                <LentActiveCard
                  book={book}
                  onOpen={() => setDetailId(book.id)}
                  onReturn={() => void returnBook(book)}
                />
              </li>
            ))}
          </ul>
        )
      ) : historyBooks.length === 0 ? (
        <div className="empty">
          <p className="empty-title">No lending history</p>
          <p className="muted">Returned loans stay visible here.</p>
        </div>
      ) : (
        <ul className="book-list">
          {historyBooks.map((book) => (
            <li key={book.id}>
              <LentHistoryCard book={book} onOpen={() => setDetailId(book.id)} />
            </li>
          ))}
        </ul>
      )}

      <BookDetailModal book={detailBook} onClose={() => setDetailId(null)} />
    </div>
  );
}

function LentActiveCard({
  book,
  onOpen,
  onReturn,
}: {
  book: Book;
  onOpen: () => void;
  onReturn: () => void;
}) {
  const lr = book.lendingRecord!;
  const overdue =
    lr.expectedReturnDate && book.isLent ? lr.expectedReturnDate < new Date() : false;

  return (
    <div className="lent-card">
      <button type="button" className="book-row" onClick={onOpen}>
        <div className="book-thumb">
          {book.coverImageUrl ? (
            <img src={book.coverImageUrl} alt="" />
          ) : (
            <BookThumbFallback />
          )}
        </div>
        <div className="book-row-main">
          <div className="book-row-title">{book.title}</div>
          <div className="muted">{book.author}</div>
        </div>
        <span className="chev">›</span>
      </button>
      <div className="lent-extra">
        <p>
          <strong>Lent to</strong> {lr.borrowerName}
        </p>
        <p className="muted small">
          Lent {lr.dateLent.toLocaleDateString()}
          {lr.expectedReturnDate && (
            <span className={overdue ? 'overdue' : ''}>
              {' '}
              · Due {lr.expectedReturnDate.toLocaleDateString()}
            </span>
          )}
        </p>
        {lr.borrowerContact && <p className="small">Contact: {lr.borrowerContact}</p>}
        {lr.notes && <p className="small muted">{lr.notes}</p>}
        <button type="button" className="btn-success full small" onClick={onReturn}>
          Mark as returned
        </button>
      </div>
    </div>
  );
}

function LentHistoryCard({ book, onOpen }: { book: Book; onOpen: () => void }) {
  const lr = book.lendingRecord!;
  const pc = primaryCategory(book);
  return (
    <button type="button" className="book-row lent-history" onClick={onOpen}>
      <div className="book-thumb">
        {book.coverImageUrl ? (
          <img src={book.coverImageUrl} alt="" />
        ) : (
          <BookThumbFallback />
        )}
      </div>
      <div className="book-row-main">
        <div className="book-row-title">{book.title}</div>
        <div className="muted">{BOOK_CATEGORY_LABELS[pc]}</div>
        <div className="muted small">
          {lr.borrowerName} · Lent {lr.dateLent.toLocaleDateString()}
          {lr.dateReturned && ` · Returned ${lr.dateReturned.toLocaleDateString()}`}
        </div>
        <span className={`status-pill ${book.isLent ? 'out' : 'in'}`}>
          {book.isLent ? 'Out' : 'Returned'}
        </span>
      </div>
      <span className="chev">›</span>
    </button>
  );
}
