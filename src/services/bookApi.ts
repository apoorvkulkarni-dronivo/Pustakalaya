import type { BookCategory } from '../types';

export interface BookDetails {
  title: string;
  author: string;
  language: string;
  numberOfPages: number;
  isbn: string;
  description: string | null;
  publishDate: string | null;
  publisher: string | null;
  coverImageURL: string | null;
  suggestedCategories: BookCategory[];
}

function cleanIsbn(isbn: string): string {
  return isbn.replace(/-/g, '').replace(/\s/g, '');
}

/** ISBN-10 check digit may be X; normalize for validation. */
function normalizeIsbnDigits(isbn: string): string {
  const d = cleanIsbn(isbn);
  if (d.length === 10 && /x$/i.test(d)) {
    return d.slice(0, 9) + 'X';
  }
  return d;
}

/** True if the check digit matches (ISBN-10 or ISBN-13 / EAN-13 book codes). */
export function isIsbnChecksumValid(isbn: string): boolean {
  const d = normalizeIsbnDigits(isbn.replace(/[^\dX]/gi, ''));
  if (d.length === 13 && /^\d{13}$/.test(d)) {
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(d[i]!, 10) * (i % 2 === 0 ? 1 : 3);
    }
    const check = (10 - (sum % 10)) % 10;
    return check === parseInt(d[12]!, 10);
  }
  if (d.length === 10 && /^\d{9}[\dX]$/.test(d)) {
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(d[i]!, 10) * (10 - i);
    }
    const checkVal = d[9] === 'X' ? 10 : parseInt(d[9]!, 10);
    return (sum + checkVal) % 11 === 0;
  }
  return false;
}

/** Convert ISBN-10 body to EAN-13 (978 prefix) for Open Library lookups. */
function isbn10ToIsbn13(isbn10: string): string | null {
  const d = normalizeIsbnDigits(isbn10);
  if (d.length !== 10) return null;
  const body = d.slice(0, 9);
  if (!/^\d{9}$/.test(body)) return null;
  const core = `978${body}`;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(core[i]!, 10) * (i % 2 === 0 ? 1 : 3);
  }
  const check = (10 - (sum % 10)) % 10;
  return `${core}${check}`;
}

function suggestCategories(book: BookDetails): BookDetails {
  const text = `${book.title} ${book.author} ${book.description ?? ''}`.toLowerCase();
  const suggested: BookCategory[] = [];

  if (text.includes('fiction') || text.includes('novel') || text.includes('story')) {
    suggested.push('fiction');
  }
  if (
    text.includes('science') ||
    text.includes('physics') ||
    text.includes('chemistry') ||
    text.includes('biology') ||
    text.includes('mathematics')
  ) {
    suggested.push('science');
  }
  if (
    text.includes('technology') ||
    text.includes('computer') ||
    text.includes('programming') ||
    text.includes('software') ||
    text.includes('digital')
  ) {
    suggested.push('technology');
  }
  if (
    text.includes('history') ||
    text.includes('historical') ||
    text.includes('war') ||
    text.includes('ancient')
  ) {
    suggested.push('history');
  }
  if (
    text.includes('biography') ||
    text.includes('autobiography') ||
    text.includes('life of')
  ) {
    suggested.push('biography');
  }
  if (
    text.includes('business') ||
    text.includes('management') ||
    text.includes('finance') ||
    text.includes('marketing') ||
    text.includes('entrepreneur')
  ) {
    suggested.push('business');
  }
  if (
    text.includes('self help') ||
    text.includes('self-help') ||
    text.includes('motivation') ||
    text.includes('personal development') ||
    text.includes('success')
  ) {
    suggested.push('selfHelp');
  }
  if (
    text.includes('art') ||
    text.includes('painting') ||
    text.includes('design') ||
    text.includes('creative')
  ) {
    suggested.push('art');
  }
  if (
    text.includes('cooking') ||
    text.includes('recipe') ||
    text.includes('food') ||
    text.includes('culinary')
  ) {
    suggested.push('cooking');
  }
  if (
    text.includes('travel') ||
    text.includes('guide') ||
    text.includes('destination') ||
    text.includes('tourism')
  ) {
    suggested.push('travel');
  }
  if (
    text.includes('health') ||
    text.includes('medical') ||
    text.includes('fitness') ||
    text.includes('wellness')
  ) {
    suggested.push('health');
  }
  if (
    text.includes('education') ||
    text.includes('learning') ||
    text.includes('textbook') ||
    text.includes('academic')
  ) {
    suggested.push('education');
  }
  if (
    text.includes('children') ||
    text.includes('kids') ||
    text.includes('young') ||
    text.includes('juvenile')
  ) {
    suggested.push('children');
  }

  if (suggested.length === 0) {
    suggested.push('nonFiction');
  }

  return { ...book, suggestedCategories: [...new Set(suggested)] };
}

interface OpenLibAuthor {
  key?: string;
  name?: string;
}

interface OpenLibDesc {
  value?: string;
  string?: string;
}

interface OpenLibResponse {
  title?: string;
  authors?: OpenLibAuthor[];
  works?: { key?: string }[];
  languages?: { key?: string }[];
  number_of_pages?: number;
  numberOfPages?: number;
  description?: OpenLibDesc | string;
  publish_date?: string;
  publishers?: { name?: string }[];
  covers?: number[];
  cover?: { small?: string; medium?: string; large?: string };
}

interface OpenLibSearchDoc {
  title?: string;
  author_name?: string | string[];
  cover_i?: number;
  number_of_pages_median?: number;
  first_publish_year?: number;
  publisher?: string[];
  isbn?: string[];
  language?: string | string[];
}

function pickIsbnFromSearchDoc(doc: OpenLibSearchDoc): string {
  const arr = doc.isbn;
  if (!Array.isArray(arr)) return '';
  for (const raw of arr) {
    const n = normalizeIsbnDigits(String(raw).replace(/[^\dX]/gi, ''));
    if (n.length === 13 && /^\d{13}$/.test(n)) return n;
  }
  for (const raw of arr) {
    const n = normalizeIsbnDigits(String(raw).replace(/[^\dX]/gi, ''));
    if (n.length === 10 && /^\d{9}[\dX]$/.test(n)) return n;
  }
  return '';
}

function languageFromOpenLibSearchDoc(doc: OpenLibSearchDoc): string {
  const lang = doc.language;
  const code = (Array.isArray(lang) ? lang[0] : lang)?.toString().toLowerCase() ?? '';
  if (code.startsWith('mar')) return 'Marathi';
  if (code.startsWith('hin')) return 'Hindi';
  if (code.startsWith('ger') || code.startsWith('deu')) return 'German';
  if (code.startsWith('eng') || code === '') return 'English';
  return 'English';
}

function openLibrarySearchDocToBookDetails(
  doc: OpenLibSearchDoc,
  isbnOverride?: string
): BookDetails | null {
  if (!doc.title) return null;
  const authorRaw = doc.author_name;
  const author = Array.isArray(authorRaw)
    ? authorRaw.join(', ')
    : (authorRaw ?? 'Unknown Author');
  const isbn = isbnOverride ?? pickIsbnFromSearchDoc(doc);
  const coverUrl =
    doc.cover_i != null ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` : null;
  const base: BookDetails = {
    title: doc.title,
    author,
    language: languageFromOpenLibSearchDoc(doc),
    numberOfPages: doc.number_of_pages_median ?? 0,
    isbn,
    description: null,
    publishDate: doc.first_publish_year != null ? String(doc.first_publish_year) : null,
    publisher: doc.publisher?.[0] ?? null,
    coverImageURL: coverUrl,
    suggestedCategories: [],
  };
  return suggestCategories(base);
}

/** Loose match so we don’t auto-fill an unrelated hit. */
function openLibraryDocMatchesTitleAuthor(
  doc: OpenLibSearchDoc,
  title: string,
  author: string
): boolean {
  const t = title.trim().toLowerCase();
  const a = author.trim().toLowerCase();
  if (!t || !a) return false;
  const dt = (doc.title ?? '').toLowerCase();
  const da = Array.isArray(doc.author_name)
    ? doc.author_name.join(' ').toLowerCase()
    : String(doc.author_name ?? '').toLowerCase();
  const titleWords = t.split(/\s+/).filter((w) => w.length > 1);
  const titleOk =
    dt === t ||
    dt.includes(t) ||
    t.includes(dt) ||
    (titleWords.length > 0 &&
      titleWords.filter((w) => dt.includes(w)).length >= Math.min(2, titleWords.length));
  const authorToks = a.split(/\s+/).filter((w) => w.length > 1);
  const authorOk = authorToks.length === 0 || authorToks.some((tok) => da.includes(tok));
  return titleOk && authorOk;
}

async function fetchOpenLibrarySearch(isbn: string): Promise<BookDetails | null> {
  const url = `https://openlibrary.org/search.json?isbn=${encodeURIComponent(isbn)}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const json = (await res.json()) as { docs?: OpenLibSearchDoc[] };
  const doc = json.docs?.[0];
  if (!doc) return null;
  return openLibrarySearchDocToBookDetails(doc, isbn);
}

async function fetchOpenLibraryByTitleAuthor(
  title: string,
  author: string
): Promise<BookDetails | null> {
  const t = title.trim();
  const a = author.trim();
  if (!t || !a) return null;
  const params = new URLSearchParams();
  params.set('title', t);
  params.set('author', a);
  params.set('limit', '20');
  const res = await fetch(`https://openlibrary.org/search.json?${params.toString()}`);
  if (!res.ok) return null;
  const json = (await res.json()) as { docs?: OpenLibSearchDoc[] };
  const docs = json.docs;
  if (!docs?.length) return null;
  for (const doc of docs) {
    if (openLibraryDocMatchesTitleAuthor(doc, t, a)) {
      const book = openLibrarySearchDocToBookDetails(doc);
      if (book) return book;
    }
  }
  return null;
}

async function resolveOpenLibraryAuthor(data: OpenLibResponse): Promise<string> {
  if (data.authors?.length) {
    const a = data.authors[0]!;
    if (a.name) return a.name;
    if (a.key) {
      try {
        const ar = await fetch(`https://openlibrary.org${a.key}.json`);
        if (ar.ok) {
          const aj = (await ar.json()) as { name?: string };
          if (aj.name) return aj.name;
        }
      } catch {
        /* ignore */
      }
    }
  }
  const wk = data.works?.[0]?.key;
  if (wk) {
    try {
      const wr = await fetch(`https://openlibrary.org${wk}.json`);
      if (wr.ok) {
        const wj = (await wr.json()) as {
          authors?: { author?: { key?: string } }[];
        };
        const ak = wj.authors?.[0]?.author?.key;
        if (ak) {
          const ar = await fetch(`https://openlibrary.org${ak}.json`);
          if (ar.ok) {
            const aj = (await ar.json()) as { name?: string };
            if (aj.name) return aj.name;
          }
        }
      }
    } catch {
      /* ignore */
    }
  }
  return 'Unknown Author';
}

async function fetchOpenLibraryEdition(isbn: string): Promise<BookDetails | null> {
  const url = `https://openlibrary.org/isbn/${encodeURIComponent(isbn)}.json`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = (await res.json()) as OpenLibResponse;
  if (!data.title) return null;

  const author = await resolveOpenLibraryAuthor(data);

  const lang =
    data.languages?.[0]?.key?.replace('/languages/', '').toUpperCase() ?? 'English';
  const pages = data.numberOfPages ?? data.number_of_pages ?? 0;
  let description: string | null = null;
  if (typeof data.description === 'string') description = data.description;
  else if (data.description && typeof data.description === 'object') {
    description = data.description.value ?? data.description.string ?? null;
  }

  let coverUrl = data.cover?.large ?? data.cover?.medium ?? data.cover?.small ?? null;
  if (!coverUrl && data.covers?.[0] != null) {
    coverUrl = `https://covers.openlibrary.org/b/id/${data.covers[0]}-L.jpg`;
  }

  const base: BookDetails = {
    title: data.title ?? 'Unknown Title',
    author,
    language: lang,
    numberOfPages: pages,
    isbn,
    description,
    publishDate: data.publish_date ?? null,
    publisher: data.publishers?.[0]?.name ?? null,
    coverImageURL: coverUrl,
    suggestedCategories: [],
  };
  return suggestCategories(base);
}

async function fetchOpenLibrary(isbn: string): Promise<BookDetails | null> {
  const edition = await fetchOpenLibraryEdition(isbn);
  if (edition) return edition;
  return fetchOpenLibrarySearch(isbn);
}

interface GoogleVolumeInfo {
  title?: string;
  authors?: string[];
  language?: string;
  pageCount?: number;
  description?: string;
  publishedDate?: string;
  publisher?: string;
  imageLinks?: { thumbnail?: string };
  industryIdentifiers?: { type?: string; identifier?: string }[];
}

interface GoogleBooksResponse {
  items?: { volumeInfo: GoogleVolumeInfo }[];
  error?: { code?: number; message?: string };
}

function pickIsbnFromGoogleVolume(v: GoogleVolumeInfo): string {
  const ids = v.industryIdentifiers;
  if (!ids) return '';
  for (const typ of ['ISBN_13', 'ISBN_10'] as const) {
    const id = ids.find((i) => i.type === typ)?.identifier;
    if (id) {
      const n = normalizeIsbnDigits(id.replace(/[^\dX]/gi, ''));
      if (n.length === 13 || n.length === 10) return n;
    }
  }
  return '';
}

function googleVolumeToBookDetails(v: GoogleVolumeInfo, isbnFallback: string): BookDetails | null {
  if (!v.title) return null;
  const isbn = pickIsbnFromGoogleVolume(v) || isbnFallback;
  const thumb = v.imageLinks?.thumbnail?.replace(/^http:\/\//, 'https://') ?? null;
  const base: BookDetails = {
    title: v.title ?? 'Unknown Title',
    author: v.authors?.join(', ') ?? 'Unknown Author',
    language: (v.language ?? 'en').toUpperCase(),
    numberOfPages: v.pageCount ?? 0,
    isbn,
    description: v.description ?? null,
    publishDate: v.publishedDate ?? null,
    publisher: v.publisher ?? null,
    coverImageURL: thumb,
    suggestedCategories: [],
  };
  return suggestCategories(base);
}

function googleVolumeMatchesTitleAuthor(
  v: GoogleVolumeInfo,
  title: string,
  author: string
): boolean {
  const t = title.trim().toLowerCase();
  const a = author.trim().toLowerCase();
  const vt = (v.title ?? '').toLowerCase();
  const va = (v.authors ?? []).join(' ').toLowerCase();
  const titleWords = t.split(/\s+/).filter((w) => w.length > 1);
  const titleOk =
    vt === t ||
    vt.includes(t) ||
    t.includes(vt) ||
    (titleWords.length > 0 &&
      titleWords.filter((w) => vt.includes(w)).length >= Math.min(2, titleWords.length));
  const authorToks = a.split(/\s+/).filter((w) => w.length > 1);
  const authorOk = authorToks.length === 0 || authorToks.some((tok) => va.includes(tok));
  return titleOk && authorOk;
}

function googleBooksApiKey(): string | undefined {
  const raw = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;
  return typeof raw === 'string' && raw.trim() ? raw.trim() : undefined;
}

async function fetchGoogleBooks(isbn: string): Promise<BookDetails | null> {
  const key = googleBooksApiKey();
  const q = encodeURIComponent(isbn);
  const url = key
    ? `https://www.googleapis.com/books/v1/volumes?q=isbn:${q}&key=${encodeURIComponent(key)}`
    : `https://www.googleapis.com/books/v1/volumes?q=isbn:${q}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = (await res.json()) as GoogleBooksResponse;
  if (data.error) return null;
  const v = data.items?.[0]?.volumeInfo;
  if (!v) return null;
  return googleVolumeToBookDetails(v, isbn);
}

async function fetchGoogleBooksByTitleAuthor(
  title: string,
  author: string
): Promise<BookDetails | null> {
  const t = title.trim();
  const a = author.trim();
  if (!t || !a) return null;
  const key = googleBooksApiKey();
  const intitle = encodeURIComponent(t);
  const inauthor = encodeURIComponent(a);
  const q = `intitle:${intitle}+inauthor:${inauthor}`;
  const url = key
    ? `https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=10&key=${encodeURIComponent(key)}`
    : `https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=10`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = (await res.json()) as GoogleBooksResponse;
  if (data.error) return null;
  const items = data.items;
  if (!items?.length) return null;
  for (const item of items) {
    const v = item.volumeInfo;
    if (googleVolumeMatchesTitleAuthor(v, t, a)) {
      const book = googleVolumeToBookDetails(v, '');
      if (book) return book;
    }
  }
  return null;
}

/** Shown when Open Library + Google Books have no usable match (new/rare ISBNs, or Google quota). */
export function isbnLookupNotFoundMessage(rawIsbn: string): string {
  const clean = normalizeIsbnDigits(rawIsbn.replace(/[^\dX]/gi, ''));
  const looksLikeIsbn = clean.length === 10 || clean.length === 13;
  const checksumOk = looksLikeIsbn && isIsbnChecksumValid(clean);

  if (looksLikeIsbn && !checksumOk) {
    return [
      `“${clean}” does not pass the ISBN check digit (likely a typo or bad scan).`,
      '',
      'Fix the number and try again, or enter title and author manually.',
    ].join('\n');
  }

  if (checksumOk) {
    return [
      `ISBN ${clean} is mathematically valid,`,
      'but Open Library’s free database does not list this edition yet.',
      '',
      'That happens often for new releases, some UK/US-only prints, or books not yet added by volunteers.',
      '',
      'You can still fill title and author (e.g. from the book cover) and save—your ISBN will be stored.',
      '',
      'Optional: add VITE_GOOGLE_BOOKS_API_KEY for broader auto-fill via Google Books.',
    ].join('\n');
  }

  return [
    `No automatic match for: ${clean || rawIsbn}.`,
    '',
    'Open Library (free) has no record, and Google Books may be unavailable without an API key.',
    '',
    'Enter title and author manually if you like.',
  ].join('\n');
}

export async function fetchBookDetails(isbn: string): Promise<BookDetails | null> {
  const clean = normalizeIsbnDigits(isbn);
  const variants: string[] = [clean];
  if (clean.length === 10) {
    const as13 = isbn10ToIsbn13(clean);
    if (as13 && !variants.includes(as13)) variants.push(as13);
  }

  for (const v of variants) {
    try {
      const ol = await fetchOpenLibrary(v);
      if (ol) return { ...ol, isbn: v };
    } catch {
      /* try next */
    }
  }

  for (const v of variants) {
    try {
      const gb = await fetchGoogleBooks(v);
      if (gb) return { ...gb, isbn: v };
    } catch {
      /* */
    }
  }
  return null;
}

/** Shown when Open Library + Google Books have no match for title + author. */
export function titleAuthorLookupNotFoundMessage(title: string, author: string): string {
  const t = title.trim();
  const a = author.trim();
  return [
    `No catalog match for “${t || '—'}” by ${a || '—'}.`,
    '',
    'Try a slightly different spelling or subtitle, or fill the rest yourself.',
    '',
    'Optional: add VITE_GOOGLE_BOOKS_API_KEY for more matches via Google Books.',
  ].join('\n');
}

export async function fetchBookDetailsByTitleAuthor(
  title: string,
  author: string
): Promise<BookDetails | null> {
  const t = title.trim();
  const a = author.trim();
  if (!t || !a) return null;
  try {
    const ol = await fetchOpenLibraryByTitleAuthor(t, a);
    if (ol) return ol;
  } catch {
    /* */
  }
  try {
    const gb = await fetchGoogleBooksByTitleAuthor(t, a);
    if (gb) return gb;
  } catch {
    /* */
  }
  return null;
}

export function validateIsbnDigits(s: string): boolean {
  const stripped = s.replace(/[^\dX]/gi, '');
  const d = normalizeIsbnDigits(stripped);
  if (d.length === 13) return /^\d{13}$/.test(d);
  if (d.length === 10) return /^\d{9}[\dX]$/.test(d);
  return false;
}

/**
 * Normalize camera / still-image scan output for ISBN lookup.
 * Accepts ISBN-10, EAN-13, or 12-digit GTIN (leading 0 → EAN-13 for APIs).
 */
export function normalizeScannedBarcode(decoded: string): string | null {
  if (!decoded?.trim()) return null;
  const d = decoded.replace(/[^\dX]/gi, '').toUpperCase();
  if (d.length === 10 && /^\d{9}[\dX]$/.test(d)) return d;
  if (d.length === 13 && /^\d{13}$/.test(d)) return d;
  if (d.length === 12 && /^\d{12}$/.test(d)) return `0${d}`;
  return null;
}

export async function urlToCompressedBlob(
  url: string,
  quality = 0.3
): Promise<Blob | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const bmp = await createImageBitmap(blob);
    const canvas = document.createElement('canvas');
    canvas.width = bmp.width;
    canvas.height = bmp.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(bmp, 0, 0);
    return new Promise((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/jpeg', quality);
    });
  } catch {
    return null;
  }
}

export async function fileToCompressedBlob(file: File, quality = 0.3): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = bmp.width;
  canvas.height = bmp.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unsupported');
  ctx.drawImage(bmp, 0, 0);
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Compress failed'))), 'image/jpeg', quality);
  });
}
