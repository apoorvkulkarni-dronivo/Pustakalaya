import { useEffect, useState } from 'react';
import type { Book } from '../types';
import { useLibrary } from '../context/LibraryContext';

type Props = { book: Book; open: boolean; onClose: () => void };

export function LendBookModal({ book, open, onClose }: Props) {
  const { lendBook } = useLibrary();
  const [borrowerName, setBorrowerName] = useState('');
  const [borrowerContact, setBorrowerContact] = useState('');
  const [notes, setNotes] = useState('');
  const [expectedReturn, setExpectedReturn] = useState('');

  useEffect(() => {
    if (open) {
      setBorrowerName('');
      setBorrowerContact('');
      setNotes('');
      setExpectedReturn('');
    }
  }, [open, book.id]);

  if (!open) return null;

  const submit = async () => {
    if (!borrowerName.trim()) return;
    let exp: Date | null = null;
    if (expectedReturn.trim()) {
      const d = new Date(expectedReturn + 'T12:00:00');
      if (!Number.isNaN(d.getTime())) exp = d;
    }
    await lendBook(
      book,
      borrowerName.trim(),
      borrowerContact.trim() || null,
      exp,
      notes.trim() || null
    );
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal sheet">
        <div className="modal-head">
          <h2>Lend Book</h2>
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
        </div>
        <p className="muted small">{book.title}</p>
        <div className="form-block">
          <label className="label">Borrower name</label>
          <input
            className="input"
            value={borrowerName}
            onChange={(e) => setBorrowerName(e.target.value)}
            placeholder="Borrower name"
          />
        </div>
        <div className="form-block">
          <label className="label">Contact (optional)</label>
          <input
            className="input"
            value={borrowerContact}
            onChange={(e) => setBorrowerContact(e.target.value)}
            placeholder="Phone or email"
          />
        </div>
        <div className="form-block">
          <label className="label">Expected return (optional)</label>
          <input
            className="input"
            type="date"
            value={expectedReturn}
            onChange={(e) => setExpectedReturn(e.target.value)}
          />
        </div>
        <div className="form-block">
          <label className="label">Notes (optional)</label>
          <textarea
            className="input area"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional notes"
          />
        </div>
        <button
          type="button"
          className="btn-primary full"
          disabled={!borrowerName.trim()}
          onClick={() => void submit()}
        >
          Lend
        </button>
      </div>
    </div>
  );
}
