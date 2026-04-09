import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  Timestamp,
  writeBatch,
  getDocs,
} from 'firebase/firestore';
import { deleteObject, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  getFirebaseAuth,
  getFirebaseDb,
  getFirebaseStorage,
  isFirebaseConfigured,
} from '../lib/firebase';
import type { Book, BookCategory, LendingRecord, WishlistItem } from '../types';

function tsToDate(v: unknown): Date {
  if (v instanceof Timestamp) return v.toDate();
  if (v instanceof Date) return v;
  if (typeof v === 'string' || typeof v === 'number') return new Date(v);
  return new Date();
}

function parseLending(data: Record<string, unknown> | null | undefined): LendingRecord | null {
  if (!data || typeof data !== 'object') return null;
  return {
    id: String(data.id ?? ''),
    borrowerName: String(data.borrowerName ?? ''),
    borrowerContact: data.borrowerContact != null ? String(data.borrowerContact) : null,
    dateLent: tsToDate(data.dateLent),
    expectedReturnDate:
      data.expectedReturnDate != null ? tsToDate(data.expectedReturnDate) : null,
    notes: data.notes != null ? String(data.notes) : null,
    isReturned: Boolean(data.isReturned),
    dateReturned: data.dateReturned != null ? tsToDate(data.dateReturned) : null,
  };
}

function bookFromFirestore(id: string, d: Record<string, unknown>): Book {
  const cats = (d.categories as string[] | undefined)?.filter(Boolean) as BookCategory[] | undefined;
  return {
    id,
    title: String(d.title ?? ''),
    author: String(d.author ?? ''),
    language: String(d.language ?? 'English'),
    categories: cats?.length ? cats : ['other'],
    numberOfPages: Number(d.numberOfPages ?? 0),
    isbn: d.isbn != null ? String(d.isbn) : null,
    coverImageUrl: d.coverImageUrl != null ? String(d.coverImageUrl) : null,
    dateAdded: tsToDate(d.dateAdded),
    isLent: Boolean(d.isLent),
    lendingRecord: parseLending(d.lendingRecord as Record<string, unknown> | null),
  };
}

function wishFromFirestore(id: string, d: Record<string, unknown>): WishlistItem {
  return {
    id,
    title: String(d.title ?? ''),
    author: String(d.author ?? ''),
    coverImageUrl: d.coverImageUrl != null ? String(d.coverImageUrl) : null,
    notes: String(d.notes ?? ''),
    dateAdded: tsToDate(d.dateAdded),
    isbn: d.isbn != null ? String(d.isbn) : null,
  };
}

function lendingToFirestore(l: LendingRecord): Record<string, unknown> {
  return {
    id: l.id,
    borrowerName: l.borrowerName,
    borrowerContact: l.borrowerContact,
    dateLent: Timestamp.fromDate(l.dateLent),
    expectedReturnDate: l.expectedReturnDate
      ? Timestamp.fromDate(l.expectedReturnDate)
      : null,
    notes: l.notes,
    isReturned: l.isReturned,
    dateReturned: l.dateReturned ? Timestamp.fromDate(l.dateReturned) : null,
  };
}

export interface LibraryContextValue {
  ready: boolean;
  user: User | null;
  firebaseOk: boolean;
  /** Set when Firebase Auth fails to initialize (invalid config, etc.) */
  firebaseBootstrapError: string | null;
  books: Book[];
  wishlistItems: WishlistItem[];
  searchText: string;
  setSearchText: (s: string) => void;
  selectedCategories: Set<BookCategory>;
  toggleCategory: (c: BookCategory) => void;
  selectedLanguages: Set<string>;
  toggleLanguage: (lang: string) => void;
  clearAllFilters: () => void;
  filteredBooks: Book[];
  lentBooks: Book[];
  availableBooks: Book[];
  addBook: (book: Omit<Book, 'id' | 'dateAdded'> & { id?: string }, coverBlob?: Blob | null) => Promise<void>;
  updateBook: (book: Book, coverBlob?: Blob | null) => Promise<void>;
  deleteBook: (book: Book) => Promise<void>;
  lendBook: (
    book: Book,
    borrowerName: string,
    contact?: string | null,
    expectedReturn?: Date | null,
    notes?: string | null
  ) => Promise<void>;
  returnBook: (book: Book) => Promise<void>;
  addWishlistItem: (item: Omit<WishlistItem, 'id' | 'dateAdded'> & { id?: string }, coverBlob?: Blob | null) => Promise<void>;
  updateWishlistItem: (item: WishlistItem, coverBlob?: Blob | null) => Promise<void>;
  removeWishlistItem: (item: WishlistItem) => Promise<void>;
  moveWishlistToLibrary: (item: WishlistItem) => Promise<Book>;
  clearAllData: () => Promise<void>;
  addSampleData: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

const LibraryContext = createContext<LibraryContextValue | null>(null);

const LANGUAGES = ['English', 'Marathi', 'Hindi', 'German'] as const;

async function uploadCover(uid: string, entityId: string, blob: Blob): Promise<string> {
  const storage = getFirebaseStorage();
  const path = `users/${uid}/covers/${entityId}.jpg`;
  const r = ref(storage, path);
  await uploadBytes(r, blob, { contentType: 'image/jpeg' });
  return getDownloadURL(r);
}

async function deleteCoverIfAny(uid: string, bookId: string): Promise<void> {
  try {
    const storage = getFirebaseStorage();
    await deleteObject(ref(storage, `users/${uid}/covers/${bookId}.jpg`));
  } catch {
    /* ignore */
  }
}

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<BookCategory>>(new Set());
  const [selectedLanguages, setSelectedLanguages] = useState<Set<string>>(new Set());
  const [firebaseBootstrapError, setFirebaseBootstrapError] = useState<string | null>(null);

  const firebaseOk = isFirebaseConfigured();

  useEffect(() => {
    setFirebaseBootstrapError(null);
    if (!firebaseOk) {
      setReady(true);
      return;
    }
    try {
      const auth = getFirebaseAuth();
      const unsub = onAuthStateChanged(auth, (u) => {
        setUser(u);
        setReady(true);
      });
      return () => unsub();
    } catch (e) {
      console.error('[Pustakalaya] Firebase init failed:', e);
      setFirebaseBootstrapError(
        e instanceof Error ? e.message : 'Firebase could not initialize. Check your .env and restart the dev server.'
      );
      setReady(true);
    }
  }, [firebaseOk]);

  useEffect(() => {
    if (!firebaseOk || !user) {
      setBooks([]);
      setWishlistItems([]);
      return;
    }
    const db = getFirebaseDb();
    const bq = query(collection(db, 'users', user.uid, 'books'), orderBy('title'));
    const wq = query(collection(db, 'users', user.uid, 'wishlist'), orderBy('title'));
    const unsubB = onSnapshot(bq, (snap) => {
      setBooks(snap.docs.map((d) => bookFromFirestore(d.id, d.data() as Record<string, unknown>)));
    });
    const unsubW = onSnapshot(wq, (snap) => {
      setWishlistItems(
        snap.docs.map((d) => wishFromFirestore(d.id, d.data() as Record<string, unknown>))
      );
    });
    return () => {
      unsubB();
      unsubW();
    };
  }, [firebaseOk, user]);

  const signInWithGoogle = useCallback(async () => {
    const auth = getFirebaseAuth();
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    await signInWithPopup(auth, provider);
  }, []);

  const signOutUser = useCallback(async () => {
    await signOut(getFirebaseAuth());
  }, []);

  const toggleCategory = useCallback((c: BookCategory) => {
    setSelectedCategories((prev) => {
      const n = new Set(prev);
      if (n.has(c)) n.delete(c);
      else n.add(c);
      return n;
    });
  }, []);

  const toggleLanguage = useCallback((lang: string) => {
    setSelectedLanguages((prev) => {
      const n = new Set(prev);
      if (n.has(lang)) n.delete(lang);
      else n.add(lang);
      return n;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setSelectedCategories(new Set());
    setSelectedLanguages(new Set());
  }, []);

  const filteredBooks = useMemo(() => {
    let list = books;
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          (b.isbn && b.isbn.toLowerCase().includes(q))
      );
    }
    if (selectedCategories.size > 0) {
      list = list.filter((b) => b.categories.some((c) => selectedCategories.has(c)));
    }
    if (selectedLanguages.size > 0) {
      list = list.filter((b) => selectedLanguages.has(b.language));
    }
    return [...list].sort((a, b) => a.title.localeCompare(b.title));
  }, [books, searchText, selectedCategories, selectedLanguages]);

  const lentBooks = useMemo(() => books.filter((b) => b.isLent), [books]);
  const availableBooks = useMemo(() => books.filter((b) => !b.isLent), [books]);

  const addBook = useCallback(
    async (book: Omit<Book, 'id' | 'dateAdded'> & { id?: string }, coverBlob?: Blob | null) => {
      if (!user) return;
      const id = book.id ?? crypto.randomUUID();
      let coverUrl = book.coverImageUrl ?? null;
      if (coverBlob) {
        coverUrl = await uploadCover(user.uid, id, coverBlob);
      }
      const db = getFirebaseDb();
      const payload: Record<string, unknown> = {
        title: book.title,
        author: book.author,
        language: book.language,
        categories: book.categories,
        numberOfPages: book.numberOfPages,
        isbn: book.isbn,
        coverImageUrl: coverUrl,
        dateAdded: Timestamp.fromDate(new Date()),
        isLent: book.isLent,
        lendingRecord: book.lendingRecord ? lendingToFirestore(book.lendingRecord) : null,
      };
      await setDoc(doc(db, 'users', user.uid, 'books', id), payload);
    },
    [user]
  );

  const updateBook = useCallback(
    async (book: Book, coverBlob?: Blob | null) => {
      if (!user) return;
      let coverUrl = book.coverImageUrl;
      if (coverBlob) {
        coverUrl = await uploadCover(user.uid, book.id, coverBlob);
      } else if (book.coverImageUrl === null) {
        await deleteCoverIfAny(user.uid, book.id);
      }
      const db = getFirebaseDb();
      const payload: Record<string, unknown> = {
        title: book.title,
        author: book.author,
        language: book.language,
        categories: book.categories,
        numberOfPages: book.numberOfPages,
        isbn: book.isbn,
        coverImageUrl: coverUrl,
        dateAdded: Timestamp.fromDate(book.dateAdded),
        isLent: book.isLent,
        lendingRecord: book.lendingRecord ? lendingToFirestore(book.lendingRecord) : null,
      };
      await setDoc(doc(db, 'users', user.uid, 'books', book.id), payload);
    },
    [user]
  );

  const deleteBook = useCallback(
    async (book: Book) => {
      if (!user) return;
      await deleteCoverIfAny(user.uid, book.id);
      const db = getFirebaseDb();
      await deleteDoc(doc(db, 'users', user.uid, 'books', book.id));
    },
    [user]
  );

  const lendBook = useCallback(
    async (
      book: Book,
      borrowerName: string,
      contact?: string | null,
      expectedReturn?: Date | null,
      notes?: string | null
    ) => {
      if (!user) return;
      const lr: LendingRecord = {
        id: crypto.randomUUID(),
        borrowerName,
        borrowerContact: contact ?? null,
        dateLent: new Date(),
        expectedReturnDate: expectedReturn ?? null,
        notes: notes ?? null,
        isReturned: false,
        dateReturned: null,
      };
      const updated: Book = {
        ...book,
        isLent: true,
        lendingRecord: lr,
      };
      await updateBook(updated);
    },
    [updateBook]
  );

  const returnBook = useCallback(
    async (book: Book) => {
      if (!book.lendingRecord) return;
      const lr: LendingRecord = {
        ...book.lendingRecord,
        isReturned: true,
        dateReturned: new Date(),
      };
      const updated: Book = { ...book, isLent: false, lendingRecord: lr };
      await updateBook(updated);
    },
    [updateBook]
  );

  const addWishlistItem = useCallback(
    async (item: Omit<WishlistItem, 'id' | 'dateAdded'> & { id?: string }, coverBlob?: Blob | null) => {
      if (!user) return;
      const id = item.id ?? crypto.randomUUID();
      let coverUrl = item.coverImageUrl ?? null;
      if (coverBlob) {
        coverUrl = await uploadCover(user.uid, `wish-${id}`, coverBlob);
      }
      const db = getFirebaseDb();
      await setDoc(doc(db, 'users', user.uid, 'wishlist', id), {
        title: item.title,
        author: item.author,
        notes: item.notes,
        isbn: item.isbn,
        coverImageUrl: coverUrl,
        dateAdded: Timestamp.fromDate(new Date()),
      });
    },
    [user]
  );

  const updateWishlistItem = useCallback(
    async (item: WishlistItem, coverBlob?: Blob | null) => {
      if (!user) return;
      let coverUrl = item.coverImageUrl;
      if (coverBlob) {
        coverUrl = await uploadCover(user.uid, `wish-${item.id}`, coverBlob);
      }
      const db = getFirebaseDb();
      await setDoc(doc(db, 'users', user.uid, 'wishlist', item.id), {
        title: item.title,
        author: item.author,
        notes: item.notes,
        isbn: item.isbn,
        coverImageUrl: coverUrl,
        dateAdded: Timestamp.fromDate(item.dateAdded),
      });
    },
    [user]
  );

  const removeWishlistItem = useCallback(
    async (item: WishlistItem) => {
      if (!user) return;
      try {
        await deleteCoverIfAny(user.uid, `wish-${item.id}`);
      } catch {
        /* */
      }
      const db = getFirebaseDb();
      await deleteDoc(doc(db, 'users', user.uid, 'wishlist', item.id));
    },
    [user]
  );

  const moveWishlistToLibrary = useCallback(
    async (item: WishlistItem): Promise<Book> => {
      if (!user) throw new Error('Not signed in');
      const id = crypto.randomUUID();
      let coverUrl = item.coverImageUrl;
      if (item.coverImageUrl) {
        try {
          const res = await fetch(item.coverImageUrl);
          const blob = await res.blob();
          coverUrl = await uploadCover(user.uid, id, blob);
        } catch {
          coverUrl = item.coverImageUrl;
        }
      }
      const newBook: Omit<Book, 'dateAdded'> = {
        id,
        title: item.title,
        author: item.author,
        language: 'English',
        categories: ['fiction'],
        numberOfPages: 0,
        isbn: item.isbn,
        coverImageUrl: coverUrl,
        isLent: false,
        lendingRecord: null,
      };
      await addBook(newBook);
      await removeWishlistItem(item);
      return { ...newBook, dateAdded: new Date() };
    },
    [user, addBook, removeWishlistItem]
  );

  const clearAllData = useCallback(async () => {
    if (!user) return;
    const db = getFirebaseDb();
    const batch = writeBatch(db);
    const booksSnap = await getDocs(collection(db, 'users', user.uid, 'books'));
    const wishSnap = await getDocs(collection(db, 'users', user.uid, 'wishlist'));
    booksSnap.docs.forEach((d) => batch.delete(d.ref));
    wishSnap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    setSearchText('');
    clearAllFilters();
    booksSnap.docs.forEach((d) => {
      void deleteCoverIfAny(user.uid, d.id);
    });
    wishSnap.docs.forEach((d) => {
      void deleteCoverIfAny(user.uid, `wish-${d.id}`);
    });
  }, [user, clearAllFilters]);

  const addSampleData = useCallback(async () => {
    const samples: Omit<Book, 'id' | 'dateAdded' | 'coverImageUrl'>[] = [
      {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        language: 'English',
        categories: ['fiction'],
        numberOfPages: 180,
        isbn: '9780743273565',
        isLent: false,
        lendingRecord: null,
      },
      {
        title: 'Sapiens',
        author: 'Yuval Noah Harari',
        language: 'English',
        categories: ['history', 'nonFiction'],
        numberOfPages: 443,
        isbn: '9780062316097',
        isLent: false,
        lendingRecord: null,
      },
      {
        title: 'Clean Code',
        author: 'Robert C. Martin',
        language: 'English',
        categories: ['technology', 'education'],
        numberOfPages: 464,
        isbn: '9780132350884',
        isLent: false,
        lendingRecord: null,
      },
      {
        title: 'Atomic Habits',
        author: 'James Clear',
        language: 'English',
        categories: ['selfHelp', 'business'],
        numberOfPages: 320,
        isbn: '9780735211292',
        isLent: false,
        lendingRecord: null,
      },
    ];
    for (const s of samples) {
      if (books.some((b) => b.title === s.title)) continue;
      await addBook({ ...s, coverImageUrl: null });
    }
  }, [addBook, books]);

  const value = useMemo<LibraryContextValue>(
    () => ({
      ready,
      user,
      firebaseOk,
      firebaseBootstrapError,
      books,
      wishlistItems,
      searchText,
      setSearchText,
      selectedCategories,
      toggleCategory,
      selectedLanguages,
      toggleLanguage,
      clearAllFilters,
      filteredBooks,
      lentBooks,
      availableBooks,
      addBook,
      updateBook,
      deleteBook,
      lendBook,
      returnBook,
      addWishlistItem,
      updateWishlistItem,
      removeWishlistItem,
      moveWishlistToLibrary,
      clearAllData,
      addSampleData,
      signInWithGoogle,
      signOutUser,
    }),
    [
      ready,
      user,
      firebaseOk,
      firebaseBootstrapError,
      books,
      wishlistItems,
      searchText,
      selectedCategories,
      toggleCategory,
      selectedLanguages,
      toggleLanguage,
      clearAllFilters,
      filteredBooks,
      lentBooks,
      availableBooks,
      addBook,
      updateBook,
      deleteBook,
      lendBook,
      returnBook,
      addWishlistItem,
      updateWishlistItem,
      removeWishlistItem,
      moveWishlistToLibrary,
      clearAllData,
      addSampleData,
      signInWithGoogle,
      signOutUser,
    ]
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary(): LibraryContextValue {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error('useLibrary must be used within LibraryProvider');
  return ctx;
}

export { LANGUAGES };
