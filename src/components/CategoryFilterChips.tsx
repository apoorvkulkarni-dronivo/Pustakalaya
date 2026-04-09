import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import {
  BOOK_CATEGORY_LABELS,
  BOOK_CATEGORY_ORDER,
  type BookCategory,
} from '../types';

const GAP_PX = 10;

/** Max category chips on the first row (after “All”). Width can fit more on large screens; we still collapse the rest behind More. */
const MAX_CATEGORIES_FIRST_ROW = 5;

type Props = {
  selectedCategories: Set<BookCategory>;
  toggleCategory: (c: BookCategory) => void;
  clearAllFilters: () => void;
};

export function CategoryFilterChips({
  selectedCategories,
  toggleCategory,
  clearAllFilters,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [visibleCount, setVisibleCount] = useState(() =>
    Math.min(MAX_CATEGORIES_FIRST_ROW, BOOK_CATEGORY_ORDER.length)
  );
  const wrapRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);

  const recalc = useCallback(() => {
    if (expanded) return;
    const wrap = wrapRef.current;
    const measure = measureRef.current;
    if (!wrap || !measure) return;

    const lineWidth = wrap.clientWidth;
    const allBtn = measure.querySelector<HTMLElement>('[data-all-measure]');
    const moreBtn = measure.querySelector<HTMLElement>('[data-more-measure]');
    const catBtns = measure.querySelectorAll<HTMLElement>('[data-cat-measure]');
    if (!allBtn || !moreBtn) return;

    const moreW = moreBtn.getBoundingClientRect().width;
    let used = allBtn.getBoundingClientRect().width + GAP_PX;
    let count = 0;

    for (let i = 0; i < catBtns.length; i++) {
      const w = catBtns[i].getBoundingClientRect().width + GAP_PX;
      const remainingAfter = catBtns.length - i - 1;
      const needMore = remainingAfter > 0;
      if (used + w + (needMore ? moreW + GAP_PX : 0) > lineWidth) break;
      used += w;
      count++;
    }

    setVisibleCount(Math.min(count, MAX_CATEGORIES_FIRST_ROW));
  }, [expanded]);

  useLayoutEffect(() => {
    recalc();
  }, [recalc]);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const ro = new ResizeObserver(() => recalc());
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [recalc]);

  useLayoutEffect(() => {
    if (expanded && visibleCount >= BOOK_CATEGORY_ORDER.length) {
      setExpanded(false);
    }
  }, [expanded, visibleCount]);

  const hiddenCats = BOOK_CATEGORY_ORDER.slice(visibleCount);
  const visibleCats = BOOK_CATEGORY_ORDER.slice(0, visibleCount);
  const hasOverflow = hiddenCats.length > 0;

  return (
    <div className="category-filter" ref={wrapRef}>
      <div ref={measureRef} className="category-filter__measure" aria-hidden>
        <button type="button" tabIndex={-1} data-all-measure className="filter-chip">
          All
        </button>
        {BOOK_CATEGORY_ORDER.map((c) => (
          <button
            key={c}
            type="button"
            tabIndex={-1}
            data-cat-measure
            className="filter-chip"
          >
            {BOOK_CATEGORY_LABELS[c]}
          </button>
        ))}
        <button type="button" tabIndex={-1} data-more-measure className="filter-chip filter-chip--more">
          More
        </button>
      </div>

      <div className="category-filter__line">
        <button
          type="button"
          className={`filter-chip ${selectedCategories.size === 0 ? 'active' : ''}`}
          onClick={clearAllFilters}
        >
          All
        </button>
        {visibleCats.map((c) => (
          <button
            key={c}
            type="button"
            className={`filter-chip ${selectedCategories.has(c) ? 'active' : ''}`}
            onClick={() => toggleCategory(c)}
          >
            {BOOK_CATEGORY_LABELS[c]}
          </button>
        ))}
        {hasOverflow && (
          <button
            type="button"
            className="filter-chip filter-chip--more"
            onClick={() => setExpanded((e) => !e)}
            aria-expanded={expanded}
            aria-controls="category-filter-expanded"
          >
            {expanded ? 'Less' : 'More'}
          </button>
        )}
      </div>

      {hasOverflow && (
        <div
          id="category-filter-expanded"
          className="category-filter__expanded"
          hidden={!expanded}
        >
          {hiddenCats.map((c) => (
            <button
              key={c}
              type="button"
              className={`filter-chip ${selectedCategories.has(c) ? 'active' : ''}`}
              onClick={() => toggleCategory(c)}
            >
              {BOOK_CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
