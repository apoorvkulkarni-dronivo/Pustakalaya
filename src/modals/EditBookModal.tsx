import { useState } from 'react';
import { fileToCompressedBlob } from '../services/bookApi';
import type { Book, BookCategory } from '../types';
import { BOOK_CATEGORY_LABELS, BOOK_CATEGORY_ORDER } from '../types';
import { useLibrary } from '../context/LibraryContext';
type Props = { book: Book; open: boolean; onClose: () => void };

export function EditBookModal({ book, open, onClose }: Props) {
  const { updateBook } = useLibrary();
  const [title, setTitle] = useState(book.title);
  const [author, setAuthor] = useState(book.author);
  const [language, setLanguage] = useState(book.language);
  const [numberOfPages, setNumberOfPages] = useState(String(book.numberOfPages));
  const [isbn, setIsbn] = useState(book.isbn ?? '');
  const [selectedCategories, setSelectedCategories] = useState<Set<BookCategory>>(
    new Set(book.categories)
  );
  const [coverPreview, setCoverPreview] = useState<string | null>(book.coverImageUrl);
  const [coverBlob, setCoverBlob] = useState<Blob | null>(null);
  const [removedCover, setRemovedCover] = useState(false);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  if (!open) return null;

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

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const blob = await fileToCompressedBlob(f);
      setCoverBlob(blob);
      setRemovedCover(false);
      setCoverPreview(URL.createObjectURL(blob));
    } catch {
      setAlertMsg('Could not read image.');
    }
  };

  const save = async () => {
    const pagesRaw = numberOfPages.trim();
    const pages = pagesRaw === '' ? 0 : parseInt(pagesRaw, 10);
    if (!title.trim() || !author.trim() || (pagesRaw !== '' && Number.isNaN(pages))) {
      setAlertMsg('Check title and author. Pages must be a number or empty (0).');
      return;
    }
    const nextCoverUrl =
      coverBlob ? book.coverImageUrl : removedCover || !coverPreview ? null : book.coverImageUrl;
    const updated: Book = {
      ...book,
      title: title.trim(),
      author: author.trim(),
      language: language.trim(),
      numberOfPages: pages,
      isbn: isbn.trim() || null,
      categories: Array.from(selectedCategories),
      coverImageUrl: nextCoverUrl,
    };
    await updateBook(updated, coverBlob);
    onClose();
  };

  return (
    <>
      <div className="modal-backdrop">
        <div className="modal sheet scroll">
          <div className="modal-head">
            <h2>Edit book</h2>
            <button type="button" className="btn-ghost" onClick={onClose}>
              Cancel
            </button>
          </div>

          <div className="form-block">
            <label className="label">Cover</label>
            {coverPreview ? (
              <div className="cover-preview-wrap">
                <img src={coverPreview} alt="" className="cover-preview" />
                <button
                  type="button"
                  className="btn-secondary small"
                  onClick={() => {
                    setCoverPreview(null);
                    setCoverBlob(null);
                    setRemovedCover(true);
                  }}
                >
                  Remove
                </button>
              </div>
            ) : null}
            <label className="file-btn">
              <input type="file" accept="image/*" className="hidden-input" onChange={onPickFile} />
              {coverPreview ? 'Change image' : 'Add image'}
            </label>
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
            <label className="label">Language</label>
            <input className="input" value={language} onChange={(e) => setLanguage(e.target.value)} />
          </div>
          <div className="form-block">
            <label className="label">Pages (optional)</label>
            <input
              className="input"
              inputMode="numeric"
              value={numberOfPages}
              onChange={(e) => setNumberOfPages(e.target.value)}
              placeholder="0 if unknown"
            />
          </div>
          <div className="form-block">
            <label className="label">ISBN (optional)</label>
            <input className="input" value={isbn} onChange={(e) => setIsbn(e.target.value)} />
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

          <button type="button" className="btn-primary full" onClick={() => void save()}>
            Save
          </button>
        </div>
      </div>
      {alertMsg && (
        <div className="modal-backdrop sub" onClick={() => setAlertMsg(null)}>
          <div className="modal tiny" onClick={(e) => e.stopPropagation()}>
            <p>{alertMsg}</p>
            <button type="button" className="btn-primary full" onClick={() => setAlertMsg(null)}>
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
}
