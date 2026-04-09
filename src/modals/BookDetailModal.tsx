import { useState } from 'react';
import type { Book } from '../types';
import { BOOK_CATEGORY_LABELS } from '../types';
import { useLibrary } from '../context/LibraryContext';
import {
  BookThumbFallback,
  IcoCalendar,
  IcoFileText,
  IcoGlobe,
  IcoTag,
  IcoUser,
} from '../components/AppIcons';
import { LendBookModal } from './LendBookModal';
import { EditBookModal } from './EditBookModal';

type Props = { book: Book | null; onClose: () => void };

function fmt(d: Date) {
  return d.toLocaleDateString(undefined, { dateStyle: 'short' });
}

function relativeAdded(d: Date) {
  const now = new Date();
  const days = Math.floor((now.getTime() - d.getTime()) / (86400 * 1000));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return fmt(d);
}

export function BookDetailModal({ book, onClose }: Props) {
  const { returnBook, deleteBook } = useLibrary();
  const [lendOpen, setLendOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmReturn, setConfirmReturn] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!book) return null;

  const lr = book.lendingRecord;

  return (
    <>
      <div className="modal-backdrop">
        <div className="modal sheet scroll">
          <div className="modal-head">
            <button type="button" className="btn-ghost" onClick={onClose}>
              Close
            </button>
            <div className="head-actions">
              <button type="button" className="btn-ghost" onClick={() => setEditOpen(true)}>
                Edit
              </button>
              <button type="button" className="btn-danger plain" onClick={() => setConfirmDelete(true)}>
                Delete
              </button>
            </div>
          </div>

          <div className="detail-cover">
            {book.coverImageUrl ? (
              <img src={book.coverImageUrl} alt="" className="detail-cover-img" />
            ) : (
              <div className="detail-cover-placeholder">
                <BookThumbFallback width={40} height={40} />
                <span className="detail-cover-ph-label">No cover</span>
              </div>
            )}
          </div>

          <h2 className="detail-title">{book.title}</h2>
          <p className="detail-author">by {book.author}</p>

          <div className="detail-cats">
            {book.categories.map((c) => (
              <span key={c} className="chip chip--neutral">
                {BOOK_CATEGORY_LABELS[c]}
              </span>
            ))}
          </div>

          <div className="detail-grid">
            <div className="detail-cell">
              <span className="detail-cell-ico" aria-hidden>
                <IcoFileText />
              </span>
              <span className="detail-cell-label">Pages</span>
              <span>{book.numberOfPages}</span>
            </div>
            <div className="detail-cell">
              <span className="detail-cell-ico" aria-hidden>
                <IcoGlobe />
              </span>
              <span className="detail-cell-label">Language</span>
              <span>{book.language}</span>
            </div>
            <div className="detail-cell">
              <span className="detail-cell-ico" aria-hidden>
                <IcoCalendar />
              </span>
              <span className="detail-cell-label">Added</span>
              <span>{relativeAdded(book.dateAdded)}</span>
            </div>
            {book.isbn && (
              <div className="detail-cell">
                <span className="detail-cell-ico" aria-hidden>
                  <IcoTag />
                </span>
                <span className="detail-cell-label">ISBN</span>
                <span className="detail-cell-mono">{book.isbn}</span>
              </div>
            )}
          </div>

          {book.isLent && lr && (
            <div className="lend-panel lend-panel--active">
              <h3 className="lend-panel-heading">
                <span className="lend-panel-ico" aria-hidden>
                  <IcoUser width={18} height={18} />
                </span>
                Currently lent to
              </h3>
              <p className="lend-borrower">{lr.borrowerName}</p>
              {lr.borrowerContact && (
                <p>
                  <span className="muted">Contact:</span> {lr.borrowerContact}
                </p>
              )}
              <p>
                <span className="muted">Lent on</span> {fmt(lr.dateLent)}
              </p>
              {lr.expectedReturnDate && (
                <p>
                  <span className="muted">Expected return</span> {fmt(lr.expectedReturnDate)}
                </p>
              )}
              {lr.notes && (
                <p className="lend-notes">
                  <span className="muted">Notes:</span> {lr.notes}
                </p>
              )}
            </div>
          )}

          <div className="detail-actions">
            {book.isLent ? (
              <button type="button" className="btn-success full" onClick={() => setConfirmReturn(true)}>
                Mark as returned
              </button>
            ) : (
              <button type="button" className="btn-primary full" onClick={() => setLendOpen(true)}>
                Lend to someone
              </button>
            )}
          </div>
        </div>
      </div>

      <LendBookModal book={book} open={lendOpen} onClose={() => setLendOpen(false)} />
      <EditBookModal book={book} open={editOpen} onClose={() => setEditOpen(false)} />

      {confirmReturn && (
        <div className="modal-backdrop sub">
          <div className="modal tiny">
            <p>Are you sure you want to mark this book as returned?</p>
            <div className="row gap">
              <button type="button" className="btn-secondary" onClick={() => setConfirmReturn(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-success"
                onClick={() => {
                  void returnBook(book);
                  setConfirmReturn(false);
                  onClose();
                }}
              >
                Return
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="modal-backdrop sub">
          <div className="modal tiny">
            <p>
              Are you sure you want to delete this book from your library? This action cannot be undone.
            </p>
            <div className="row gap">
              <button type="button" className="btn-secondary" onClick={() => setConfirmDelete(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={() => {
                  void deleteBook(book);
                  setConfirmDelete(false);
                  onClose();
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
