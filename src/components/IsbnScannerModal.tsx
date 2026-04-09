import { useEffect, useRef, useState } from 'react';
import { validateIsbnDigits } from '../services/bookApi';

type Props = {
  open: boolean;
  onClose: () => void;
  onIsbn: (isbn: string) => void;
};

export function IsbnScannerModal({ open, onClose, onIsbn }: Props) {
  const [err, setErr] = useState<string | null>(null);
  const aliveRef = useRef(true);
  const qrRef = useRef<{ stop: () => Promise<void> } | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    aliveRef.current = true;
    setErr(null);
    const elId = 'isbn-scanner-region';

    const run = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        if (!aliveRef.current) return;
        const qr = new Html5Qrcode(elId);
        qrRef.current = qr;
        if (!aliveRef.current) return;
        await qr.start(
          { facingMode: 'environment' },
          { fps: 8, qrbox: { width: 280, height: 140 } },
          (decoded) => {
            const cleaned = decoded.replace(/-/g, '').replace(/\s/g, '');
            if (validateIsbnDigits(cleaned)) {
              void qr.stop().catch(() => {});
              onIsbn(decoded);
              onClose();
            }
          },
          () => {}
        );
      } catch (e) {
        if (aliveRef.current) {
          setErr(e instanceof Error ? e.message : 'Camera failed. Try manual ISBN entry.');
        }
      }
    };

    void run();

    return () => {
      aliveRef.current = false;
      const q = qrRef.current;
      qrRef.current = null;
      if (q) {
        void q.stop().catch(() => {});
      }
    };
  }, [open, onClose, onIsbn]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal>
      <div className="modal sheet">
        <div className="modal-head">
          <h2>Scan ISBN</h2>
          <button type="button" className="btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>
        <p className="muted small">Point the camera at the book barcode (EAN-13 / ISBN).</p>
        {err && <p className="error-text">{err}</p>}
        <div id="isbn-scanner-region" className="scanner-region" />
      </div>
    </div>
  );
}
