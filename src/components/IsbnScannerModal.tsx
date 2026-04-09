import { useEffect, useRef, useState } from 'react';
import { normalizeScannedBarcode } from '../services/bookApi';

type Props = {
  open: boolean;
  onClose: () => void;
  onIsbn: (isbn: string) => void;
};

function scannerFormats() {
  return import('html5-qrcode').then(({ Html5QrcodeSupportedFormats }) => [
    Html5QrcodeSupportedFormats.EAN_13,
    Html5QrcodeSupportedFormats.EAN_8,
    Html5QrcodeSupportedFormats.UPC_A,
    Html5QrcodeSupportedFormats.UPC_E,
    Html5QrcodeSupportedFormats.CODE_128,
    Html5QrcodeSupportedFormats.CODE_39,
    Html5QrcodeSupportedFormats.QR_CODE,
  ]);
}

export function IsbnScannerModal({ open, onClose, onIsbn }: Props) {
  const [err, setErr] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [fileBusy, setFileBusy] = useState(false);
  const aliveRef = useRef(true);
  const qrRef = useRef<{ stop: () => Promise<void>; clear: () => void } | null>(null);
  const videoRegionId = useRef(`isbn-scan-video-${crypto.randomUUID()}`);
  const fileRegionId = useRef(`isbn-scan-file-${crypto.randomUUID()}`);
  const onIsbnRef = useRef(onIsbn);
  const onCloseRef = useRef(onClose);
  onIsbnRef.current = onIsbn;
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) {
      return;
    }
    aliveRef.current = true;
    setErr(null);
    setHint(null);
    const elId = videoRegionId.current;

    const run = async () => {
      try {
        const [{ Html5Qrcode }, formatsToSupport] = await Promise.all([
          import('html5-qrcode'),
          scannerFormats(),
        ]);
        if (!aliveRef.current) return;
        const qr = new Html5Qrcode(elId, {
          verbose: false,
          formatsToSupport,
          /** ZXing path is often more reliable for 1D book barcodes than the native detector. */
          useBarCodeDetectorIfSupported: false,
        });
        qrRef.current = qr;
        if (!aliveRef.current) return;
        await qr.start(
          { facingMode: 'environment' },
          {
            fps: 12,
            qrbox: (vw, vh) => {
              const w = Math.min(520, Math.floor(vw * 0.94));
              const h = Math.min(240, Math.floor(vh * 0.38));
              return { width: w, height: Math.max(120, h) };
            },
            aspectRatio: 1.777778,
          },
          (decoded) => {
            const norm = normalizeScannedBarcode(decoded);
            if (norm) {
              void qr.stop().catch(() => {});
              onIsbnRef.current(norm);
              onCloseRef.current();
              return;
            }
            const preview = decoded.replace(/\s+/g, ' ').slice(0, 48);
            setHint(
              preview
                ? `Read “${preview}” — not a 10- or 13-digit book code. Try centering the ISBN barcode, or use a photo below.`
                : 'Unrecognized barcode. Try the photo option or enter the ISBN manually.'
            );
          },
          () => {}
        );
      } catch (e) {
        if (aliveRef.current) {
          setErr(e instanceof Error ? e.message : 'Camera failed. Try a photo of the barcode or manual entry.');
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
  }, [open]);

  const onPickBarcodePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setHint(null);
    setFileBusy(true);
    try {
      const [{ Html5Qrcode }, formatsToSupport] = await Promise.all([
        import('html5-qrcode'),
        scannerFormats(),
      ]);
      const hid = fileRegionId.current;
      const qr = new Html5Qrcode(hid, {
        verbose: false,
        formatsToSupport,
        useBarCodeDetectorIfSupported: false,
      });
      try {
        const decoded = await qr.scanFile(file, false);
        const norm = normalizeScannedBarcode(decoded);
        if (norm) {
          void qrRef.current?.stop().catch(() => {});
          onIsbn(norm);
          onClose();
        } else {
          setHint(
            'That image did not contain a readable ISBN/EAN. Try a straighter, well-lit photo of the barcode strip.'
          );
        }
      } finally {
        qr.clear();
      }
    } catch {
      setHint('No barcode found in that photo. Try again or type the ISBN manually.');
    } finally {
      setFileBusy(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal>
      <div className="modal sheet scroll">
        <div className="modal-head">
          <h2>Scan ISBN</h2>
          <button type="button" className="btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>
        <p className="muted small">
          Line up the <strong>ISBN barcode</strong> (the block of vertical bars above the 13-digit number). Hold steady
          and use good light.
        </p>
        {err && <p className="error-text">{err}</p>}
        {hint && !err && <p className="muted small">{hint}</p>}
        <div id={videoRegionId.current} className="scanner-region" />

        <div className="form-block">
          <label className="label">Or use a photo</label>
          <p className="muted small">If the live camera never picks it up, snap the barcode and choose the image here.</p>
          <label className={`file-btn file-btn--primary full${fileBusy ? ' is-busy' : ''}`}>
            <input
              type="file"
              accept="image/*"
              className="hidden-input"
              disabled={fileBusy}
              onChange={(ev) => void onPickBarcodePhoto(ev)}
            />
            {fileBusy ? 'Reading image…' : 'Choose barcode photo'}
          </label>
        </div>

        {/* Off-screen target for html5-qrcode file scanning (must exist in DOM). */}
        <div
          id={fileRegionId.current}
          className="scanner-file-target"
          aria-hidden
        />
      </div>
    </div>
  );
}
