export type BookCategory =
  | 'fiction'
  | 'nonFiction'
  | 'science'
  | 'technology'
  | 'history'
  | 'biography'
  | 'selfHelp'
  | 'business'
  | 'art'
  | 'cooking'
  | 'travel'
  | 'health'
  | 'education'
  | 'children'
  | 'other';

export const BOOK_CATEGORY_ORDER: BookCategory[] = [
  'fiction',
  'nonFiction',
  'science',
  'technology',
  'history',
  'biography',
  'selfHelp',
  'business',
  'art',
  'cooking',
  'travel',
  'health',
  'education',
  'children',
  'other',
];

export const BOOK_CATEGORY_LABELS: Record<BookCategory, string> = {
  fiction: 'Fiction',
  nonFiction: 'Non-Fiction',
  science: 'Science',
  technology: 'Technology',
  history: 'History',
  biography: 'Biography',
  selfHelp: 'Self Help',
  business: 'Business',
  art: 'Art',
  cooking: 'Cooking',
  travel: 'Travel',
  health: 'Health',
  education: 'Education',
  children: 'Children',
  other: 'Other',
};

export interface LendingRecord {
  id: string;
  borrowerName: string;
  borrowerContact: string | null;
  dateLent: Date;
  expectedReturnDate: Date | null;
  notes: string | null;
  isReturned: boolean;
  dateReturned: Date | null;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  language: string;
  categories: BookCategory[];
  numberOfPages: number;
  isbn: string | null;
  coverImageUrl: string | null;
  dateAdded: Date;
  isLent: boolean;
  lendingRecord: LendingRecord | null;
}

export interface WishlistItem {
  id: string;
  title: string;
  author: string;
  coverImageUrl: string | null;
  notes: string;
  dateAdded: Date;
  isbn: string | null;
}

export type TabId = 'library' | 'wishlist' | 'lent' | 'stats' | 'settings';

export function primaryCategory(b: Book): BookCategory {
  return b.categories[0] ?? 'other';
}
