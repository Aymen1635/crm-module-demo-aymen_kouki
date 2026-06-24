'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
}

export function Pagination({ currentPage, totalPages, total, limit }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    params.set('page', String(page));
    router.push(`${pathname ?? '/opportunities'}?${params.toString()}`);
  }

  if (totalPages <= 1) return null;

  const from = (currentPage - 1) * limit + 1;
  const to = Math.min(currentPage * limit, total);

  // Build page number array (show max 5 around current)
  const pages: number[] = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="pagination">
      <button
        className={`page-btn ${currentPage === 1 ? 'disabled' : ''}`}
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        ‹
      </button>

      {start > 1 && (
        <>
          <button className="page-btn" onClick={() => goToPage(1)}>1</button>
          {start > 2 && <span className="page-btn" style={{ cursor: 'default', opacity: 0.4 }}>…</span>}
        </>
      )}

      {pages.map((page) => (
        <button
          key={page}
          className={`page-btn ${page === currentPage ? 'active' : ''}`}
          onClick={() => goToPage(page)}
          aria-label={`Page ${page}`}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="page-btn" style={{ cursor: 'default', opacity: 0.4 }}>…</span>}
          <button className="page-btn" onClick={() => goToPage(totalPages)}>{totalPages}</button>
        </>
      )}

      <button
        className={`page-btn ${currentPage === totalPages ? 'disabled' : ''}`}
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        ›
      </button>

      <span className="pagination-info">
        {from}–{to} of {total}
      </span>
    </div>
  );
}
