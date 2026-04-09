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
  languages?: { key?: string }[];
  number_of_pages?: number;
  numberOfPages?: number;
  description?: OpenLibDesc | string;
  publish_date?: string;
  publishers?: { name?: string }[];
  covers?: number[];
  cover?: { small?: string; medium?: string; large?: string };
}

async function fetchOpenLibrary(isbn: string): Promise<BookDetails | null> {
  const url = `https://openlibrary.org/isbn/${encodeURIComponent(isbn)}.json`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = (await res.json()) as OpenLibResponse;

  let author = 'Unknown Author';
  if (data.authors?.length) {
    const a = data.authors[0];
    if (a.name) {
      author = a.name;
    } else if (a.key) {
      try {
        const ar = await fetch(`https://openlibrary.org${a.key}.json`);
        if (ar.ok) {
          const aj = (await ar.json()) as { name?: string };
          if (aj.name) author = aj.name;
        }
      } catch {
        /* ignore */
      }
    }
  }

  const lang =
    data.languages?.[0]?.key?.replace('/languages/', '').toUpperCase() ?? 'English';
  const pages = data.numberOfPages ?? data.number_of_pages ?? 0;
  let description: string | null = null;
  if (typeof data.description === 'string') description = data.description;
  else if (data.description && typeof data.description === 'object') {
    description = data.description.value ?? data.description.string ?? null;
  }

  const coverUrl =
    data.cover?.large ?? data.cover?.medium ?? data.cover?.small ?? null;

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

interface GoogleBooksResponse {
  items?: {
    volumeInfo: {
      title?: string;
      authors?: string[];
      language?: string;
      pageCount?: number;
      description?: string;
      publishedDate?: string;
      publisher?: string;
      imageLinks?: { thumbnail?: string };
    };
  }[];
}

async function fetchGoogleBooks(isbn: string): Promise<BookDetails | null> {
  const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${encodeURIComponent(isbn)}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = (await res.json()) as GoogleBooksResponse;
  const v = data.items?.[0]?.volumeInfo;
  if (!v) return null;

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

export async function fetchBookDetails(isbn: string): Promise<BookDetails | null> {
  const clean = cleanIsbn(isbn);
  try {
    const ol = await fetchOpenLibrary(clean);
    if (ol) return ol;
  } catch {
    /* try google */
  }
  try {
    const gb = await fetchGoogleBooks(clean);
    if (gb) return gb;
  } catch {
    /* */
  }
  return null;
}

export function validateIsbnDigits(s: string): boolean {
  const d = cleanIsbn(s);
  return d.length === 10 || d.length === 13;
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
