import { useEffect, useState } from 'react';
import {
  fetchBookDetails,
  fetchBookDetailsByTitleAuthor,
  fileToCompressedBlob,
  isbnLookupNotFoundMessage,
  titleAuthorLookupNotFoundMessage,
  urlToCompressedBlob,
} from '../services/bookApi';
import type { BookDetails } from '../services/bookApi';
import type { BookCategory } from '../types';
import { BOOK_CATEGORY_LABELS, BOOK_CATEGORY_ORDER } from '../types';
import { useLibrary } from '../context/LibraryContext';
import { IsbnScannerModal } from '../components/IsbnScannerModal';
import { IcoBook } from '../components/AppIcons';

type Props = { open: boolean; onClose: () => void };

const LANGS = ['English', 'Marathi', 'Hindi', 'German'];

const initialForm = () => ({
  title: '',
  author: '',
  language: 'English',
  categories: new Set<BookCategory>(['other']),
  numberOfPages: '',
  isbn: '',
  coverPreview: null as string | null,
  coverBlob: null as Blob | null,
  fetched: null as BookDetails | null,
});

export function AddBookModal({ open, onClose }: Props) {
  const { addBook } = useLibrary();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [language, setLanguage] = useState('English');
  const [selectedCategories, setSelectedCategories] = useState<Set<BookCategory>>(
    new Set(['other'])
  );
  const [numberOfPages, setNumberOfPages] = useState('');
  const [isbn, setIsbn] = useState('');
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverBlob, setCoverBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState<BookDetails | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const s = initialForm();
    setTitle(s.title);
    setAuthor(s.author);
    setLanguage(s.language);
    setSelectedCategories(s.categories);
    setNumberOfPages(s.numberOfPages);
    setIsbn(s.isbn);
    setCoverPreview(s.coverPreview);
    setCoverBlob(s.coverBlob);
    setFetched(s.fetched);
    setLoading(false);
    setAlertMsg(null);
  }, [open]);

  if (!open) return null;

  const close = () => {
    const s = initialForm();
    setTitle(s.title);
    setAuthor(s.author);
    setLanguage(s.language);
    setSelectedCategories(s.categories);
    setNumberOfPages(s.numberOfPages);
    setIsbn(s.isbn);
    setCoverPreview(s.coverPreview);
    setCoverBlob(s.coverBlob);
    setFetched(s.fetched);
    onClose();
  };

  const toggleCat = (c: BookCategory) => {
    setSelectedCategories((prev) => {
      const n = new Set(prev);
      if (n.has(c)) {
        n.delete(c);
        if (n.size === 0) n.add('other');
      } else n.add(c);
      return n;
    });
  };

  const loadFromIsbn = async (raw: string) => {
    setIsbn(raw.replace(/[^\dX]/gi, ''));
    setLoading(true);
    setFetched(null);
    try {
      const d = await fetchBookDetails(raw);
      if (d) {
        setFetched(d);
        setTitle(d.title);
        setAuthor(d.author);
        setLanguage(d.language.length > 2 ? d.language : 'English');
        setNumberOfPages(String(d.numberOfPages));
        if (d.suggestedCategories.length) {
          setSelectedCategories(new Set(d.suggestedCategories));
        }
        if (d.coverImageURL) {
          const blob = await urlToCompressedBlob(d.coverImageURL);
          if (blob) {
            setCoverBlob(blob);
            setCoverPreview(URL.createObjectURL(blob));
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

  const loadFromTitleAuthor = async () => {
    const t = title.trim();
    const a = author.trim();
    setLoading(true);
    setFetched(null);
    try {
      const d = await fetchBookDetailsByTitleAuthor(t, a);
      if (d) {
        setFetched(d);
        setTitle(d.title);
        setAuthor(d.author);
        setLanguage(d.language.length > 2 ? d.language : 'English');
        setNumberOfPages(String(d.numberOfPages));
        if (d.isbn) setIsbn(d.isbn.replace(/[^\dX]/gi, ''));
        if (d.suggestedCategories.length) {
          setSelectedCategories(new Set(d.suggestedCategories));
        }
        if (d.coverImageURL) {
          const blob = await urlToCompressedBlob(d.coverImageURL);
          if (blob) {
            setCoverBlob(blob);
            setCoverPreview(URL.createObjectURL(blob));
          }
        }
      } else {
        setAlertMsg(titleAuthorLookupNotFoundMessage(t, a));
      }
    } catch {
      setAlertMsg('Failed to fetch book data.');
    } finally {
      setLoading(false);
    }
  };

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const blob = await fileToCompressedBlob(f);
      setCoverBlob(blob);
      setCoverPreview(URL.createObjectURL(blob));
    } catch {
      setAlertMsg('Could not read image.');
    }
  };

  const save = async () => {
    const pages = parseInt(numberOfPages, 10);
    if (!title.trim() || !author.trim() || Number.isNaN(pages)) {
      setAlertMsg('Title, author, and valid page count are required.');
      return;
    }
    await addBook(
      {
        title: title.trim(),
        author: author.trim(),
        language,
        categories: Array.from(selectedCategories),
        numberOfPages: pages,
        isbn: isbn.trim() || null,
        coverImageUrl: null,
        isLent: false,
        lendingRecord: null,
      },
      coverBlob
    );
    close();
  };

  return (
    <>
      <div className="modal-backdrop">
        <div className="modal sheet scroll add-book-modal">
          <div className="modal-head add-book-head">
            <h2 className="sr-only">Add New Book</h2>
            <button type="button" className="btn-ghost" onClick={close}>
              Cancel
            </button>
          </div>

          <div className="add-book-hero">
            <div className="add-book-hero-icon" aria-hidden>
              <IcoBook width={32} height={32} />
            </div>
            <p className="add-book-hero-title">Add New Book</p>
            <p className="add-book-hero-sub muted">Scan barcode or enter details manually</p>
          </div>

          <div className="form-block">
            <label className="label">Book cover</label>
            {coverPreview ? (
              <div className="cover-preview-wrap">
                <img src={coverPreview} alt="" className="cover-preview" />
                <button
                  type="button"
                  className="btn-secondary small"
                  onClick={() => {
                    setCoverPreview(null);
                    setCoverBlob(null);
                  }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="cover-actions">
                <label className="file-btn file-btn--primary">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden-input"
                    onChange={onPickFile}
                  />
                  Take photo
                </label>
                <label className="file-btn">
                  <input type="file" accept="image/*" className="hidden-input" onChange={onPickFile} />
                  Choose from photos
                </label>
              </div>
            )}
          </div>

          <div className="form-block">
            <label className="label">Book title</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="form-block">
            <label className="label">Author</label>
            <input className="input" value={author} onChange={(e) => setAuthor(e.target.value)} />
          </div>
          <div className="form-block">
            <label className="label">Look up without ISBN</label>
            <p className="muted small">
              If Open Library or Google Books lists this edition, we fill pages, language, cover, and ISBN when
              available.
            </p>
            <button
              type="button"
              className="btn-secondary full mt"
              disabled={loading || !title.trim() || !author.trim()}
              onClick={() => void loadFromTitleAuthor()}
            >
              {loading ? 'Fetching book data…' : 'Fill from title & author'}
            </button>
          </div>

          {fetched && (
            <div className="form-block">
              <div className="success-banner small">Book data found — fields updated below.</div>
            </div>
          )}

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
              onClick={() => loadFromIsbn(isbn)}
            >
              {loading ? 'Fetching book data…' : 'Scan ISBN barcode'}
            </button>
          </div>

          <div className="form-block">
            <label className="label">Language</label>
            <select
              className="input"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {LANGS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div className="form-block">
            <label className="label">Categories</label>
            <div className="category-grid">
              {BOOK_CATEGORY_ORDER.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`cat-pill ${selectedCategories.has(c) ? 'on' : ''}`}
                  onClick={() => toggleCat(c)}
                >
                  {BOOK_CATEGORY_LABELS[c]}
                </button>
              ))}
            </div>
          </div>
          <div className="form-block">
            <label className="label">Number of pages</label>
            <input
              className="input"
              inputMode="numeric"
              value={numberOfPages}
              onChange={(e) => setNumberOfPages(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="btn-primary full"
            disabled={!title.trim() || !author.trim() || !numberOfPages.trim()}
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
