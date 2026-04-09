import { useState } from 'react';
import { useLibrary } from '../context/LibraryContext';
import type { WishlistItem } from '../types';
import {
  fetchBookDetails,
  fileToCompressedBlob,
  isbnLookupNotFoundMessage,
  urlToCompressedBlob,
} from '../services/bookApi';
import { IsbnScannerModal } from '../components/IsbnScannerModal';
import { BookThumbFallback, IcoPlus } from '../components/AppIcons';

export function WishlistTab() {
  const { wishlistItems, removeWishlistItem, moveWishlistToLibrary } = useLibrary();
  const [quickOpen, setQuickOpen] = useState(false);
  const [editItem, setEditItem] = useState<WishlistItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  return (
    <div className="tab-page">
      <header className="page-header">
        <h1>Wishlist</h1>
        <button type="button" className="icon-btn icon-btn--fab" aria-label="Add" onClick={() => setQuickOpen(true)}>
          <IcoPlus />
        </button>
      </header>

      {wishlistItems.length === 0 ? (
        <div className="empty">
          <p className="empty-title">Your wishlist is empty</p>
          <p className="muted">Add books you want to read later.</p>
          <button type="button" className="btn-primary" onClick={() => setQuickOpen(true)}>
            Add to wishlist
          </button>
        </div>
      ) : (
        <ul className="wish-list">
          {wishlistItems.map((item) => (
            <li key={item.id} className="wish-card">
              <div className="wish-thumb">
                {item.coverImageUrl ? <img src={item.coverImageUrl} alt="" /> : <BookThumbFallback />}
              </div>
              <div className="wish-body">
                <div className="book-row-title">{item.title}</div>
                <div className="muted">by {item.author}</div>
                {item.notes && <p className="wish-notes">{item.notes}</p>}
                <p className="muted small">Added {item.dateAdded.toLocaleDateString()}</p>
              </div>
              <details className="wish-menu">
                <summary>⋯</summary>
                <div className="wish-menu-pop">
                  <button
                    type="button"
                    onClick={() => {
                      void moveWishlistToLibrary(item).then((b) => {
                        setToast(`${b.title} moved to library.`);
                      });
                    }}
                  >
                    Move to library
                  </button>
                  <button type="button" onClick={() => setEditItem(item)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="danger"
                    onClick={() => {
                      void removeWishlistItem(item);
                      setToast('Removed from wishlist.');
                    }}
                  >
                    Remove
                  </button>
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}

      {quickOpen && (
        <QuickWishlistModal
          onClose={() => setQuickOpen(false)}
          onSaved={() => {
            setQuickOpen(false);
            setToast('Saved to wishlist.');
          }}
        />
      )}

      {editItem && (
        <EditWishlistModal
          item={editItem}
          onClose={() => setEditItem(null)}
          onSaved={() => {
            setEditItem(null);
            setToast('Wishlist updated.');
          }}
        />
      )}

      {toast && (
        <div className="toast" role="status">
          {toast}
          <button type="button" className="toast-x" onClick={() => setToast(null)}>
            ×
          </button>
        </div>
      )}
    </div>
  );
}

function QuickWishlistModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const { addWishlistItem } = useLibrary();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [notes, setNotes] = useState('');
  const [isbn, setIsbn] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [fetchedFromIsbn, setFetchedFromIsbn] = useState(false);

  const loadFromIsbn = async (raw: string) => {
    setIsbn(raw.replace(/[^\dX]/gi, ''));
    setLoading(true);
    setFetchedFromIsbn(false);
    try {
      const d = await fetchBookDetails(raw);
      if (d) {
        setFetchedFromIsbn(true);
        setTitle(d.title);
        setAuthor(d.author);
        setIsbn(d.isbn);
        if (d.coverImageURL) {
          const cBlob = await urlToCompressedBlob(d.coverImageURL);
          if (cBlob) {
            setBlob(cBlob);
            setPreview(URL.createObjectURL(cBlob));
          }
        }
      } else {
        setAlertMsg(isbnLookupNotFoundMessage(raw));
      }
    } catch {
      setAlertMsg('Failed to fetch book data.');
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    if (!title.trim() || !author.trim()) return;
    await addWishlistItem(
      {
        title: title.trim(),
        author: author.trim(),
        notes,
        isbn: isbn.trim() || null,
        coverImageUrl: null,
      },
      blob
    );
    onSaved();
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const b = await fileToCompressedBlob(f);
      setBlob(b);
      setPreview(URL.createObjectURL(b));
    } catch {
      setAlertMsg('Could not read image.');
    }
  };

  return (
    <>
      <div className="modal-backdrop">
        <div className="modal sheet scroll">
          <div className="modal-head">
            <h2>Add to wishlist</h2>
            <button type="button" className="btn-ghost" onClick={onClose}>
              Cancel
            </button>
          </div>
          <div className="form-block">
            <label className="label">Cover (optional)</label>
            {preview && <img src={preview} alt="" className="cover-preview small" />}
            <div className="cover-actions">
              <label className="file-btn file-btn--primary">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden-input"
                  onChange={(e) => void onFile(e)}
                />
                Take photo
              </label>
              <label className="file-btn">
                <input type="file" accept="image/*" className="hidden-input" onChange={(e) => void onFile(e)} />
                Choose from photos
              </label>
            </div>
          </div>

          <div className="form-block isbn-block">
            <label className="label">ISBN — scan or lookup</label>
            <div className="row gap">
              <input
                className="input"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                placeholder="Enter or scan ISBN"
              />
              <button
                type="button"
                className="btn-primary"
                disabled={loading}
                onClick={() => setScannerOpen(true)}
              >
                {loading ? '…' : 'Scan'}
              </button>
            </div>
            <button
              type="button"
              className="btn-secondary full mt"
              disabled={loading || !isbn.trim()}
              onClick={() => void loadFromIsbn(isbn)}
            >
              {loading ? 'Fetching book data…' : 'Look up by ISBN'}
            </button>
            {fetchedFromIsbn && (
              <div className="success-banner small mt">Book data found — title, author, and cover updated.</div>
            )}
          </div>

          <div className="form-block">
            <label className="label">Title</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="form-block">
            <label className="label">Author</label>
            <input className="input" value={author} onChange={(e) => setAuthor(e.target.value)} />
          </div>
          <div className="form-block">
            <label className="label">Notes</label>
            <textarea className="input area" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <button
            type="button"
            className="btn-primary full pink"
            disabled={!title.trim() || !author.trim()}
            onClick={() => void save()}
          >
            Save
          </button>
        </div>
      </div>

      <IsbnScannerModal
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onIsbn={(code) => void loadFromIsbn(code)}
      />

      {alertMsg && (
        <div className="modal-backdrop sub" onClick={() => setAlertMsg(null)}>
          <div className="modal tiny modal-tiny-wide" onClick={(e) => e.stopPropagation()}>
            <p className="modal-alert-msg">{alertMsg}</p>
            <button type="button" className="btn-primary full" onClick={() => setAlertMsg(null)}>
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function EditWishlistModal({
  item,
  onClose,
  onSaved,
}: {
  item: WishlistItem;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { updateWishlistItem } = useLibrary();
  const [title, setTitle] = useState(item.title);
  const [author, setAuthor] = useState(item.author);
  const [notes, setNotes] = useState(item.notes);
  const [isbn, setIsbn] = useState(item.isbn ?? '');
  const [preview, setPreview] = useState<string | null>(item.coverImageUrl);
  const [blob, setBlob] = useState<Blob | null>(null);

  const save = async () => {
    await updateWishlistItem(
      {
        ...item,
        title: title.trim(),
        author: author.trim(),
        notes,
        isbn: isbn.trim() || null,
        coverImageUrl: blob ? null : item.coverImageUrl,
      },
      blob
    );
    onSaved();
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const b = await fileToCompressedBlob(f);
    setBlob(b);
    setPreview(URL.createObjectURL(b));
  };

  return (
    <div className="modal-backdrop">
      <div className="modal sheet scroll">
        <div className="modal-head">
          <h2>Edit wishlist</h2>
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
        </div>
        <div className="form-block">
          <label className="label">Cover</label>
          {preview && <img src={preview} alt="" className="cover-preview small" />}
          <div className="cover-actions">
            <label className="file-btn file-btn--primary">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden-input"
                onChange={(e) => void onFile(e)}
              />
              Take photo
            </label>
            <label className="file-btn">
              <input type="file" accept="image/*" className="hidden-input" onChange={(e) => void onFile(e)} />
              Change photo
            </label>
          </div>
        </div>
        <div className="form-block">
          <label className="label">Title</label>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="form-block">
          <label className="label">Author</label>
          <input className="input" value={author} onChange={(e) => setAuthor(e.target.value)} />
        </div>
        <div className="form-block">
          <label className="label">Notes</label>
          <textarea className="input area" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div className="form-block">
          <label className="label">ISBN (optional)</label>
          <input className="input" value={isbn} onChange={(e) => setIsbn(e.target.value)} placeholder="ISBN" />
        </div>
        <button
          type="button"
          className="btn-primary full"
          disabled={!title.trim() || !author.trim()}
          onClick={() => void save()}
        >
          Save
        </button>
      </div>
    </div>
  );
}
