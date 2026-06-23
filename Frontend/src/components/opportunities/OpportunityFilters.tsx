'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  ALL_STAGES,
  ALL_CLIENT_TYPES,
  STAGE_LABELS,
  CLIENT_TYPE_LABELS,
} from '@/lib/utils';

export function OpportunityFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentStage = searchParams.get('stage') ?? '';
  const currentClientType = searchParams.get('clientType') ?? '';
  const currentSortBy = searchParams.get('sortBy') ?? 'createdAt';
  const currentOrder = searchParams.get('order') ?? 'desc';

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Reset to page 1 when filter changes
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  }

  function clearFilters() {
    router.push(pathname);
  }

  const hasActiveFilters = currentStage || currentClientType;

  return (
    <div className="filters-bar">
      <span className="filters-label">Filter</span>

      <select
        className="filter-select"
        value={currentStage}
        onChange={(e) => updateFilter('stage', e.target.value)}
        aria-label="Filter by stage"
      >
        <option value="">All stages</option>
        {ALL_STAGES.map((stage) => (
          <option key={stage} value={stage}>
            {STAGE_LABELS[stage]}
          </option>
        ))}
      </select>

      <select
        className="filter-select"
        value={currentClientType}
        onChange={(e) => updateFilter('clientType', e.target.value)}
        aria-label="Filter by client type"
      >
        <option value="">All client types</option>
        {ALL_CLIENT_TYPES.map((type) => (
          <option key={type} value={type}>
            {CLIENT_TYPE_LABELS[type]}
          </option>
        ))}
      </select>

      <span className="filters-label" style={{ marginLeft: '8px' }}>
        Sort
      </span>

      <select
        className="filter-select"
        value={currentSortBy}
        onChange={(e) => updateFilter('sortBy', e.target.value)}
        aria-label="Sort by field"
      >
        <option value="createdAt">Created date</option>
        <option value="amountCents">Amount</option>
        <option value="expectedSignatureDate">Expected date</option>
        <option value="stage">Stage</option>
      </select>

      <select
        className="filter-select"
        value={currentOrder}
        onChange={(e) => updateFilter('order', e.target.value)}
        aria-label="Sort order"
      >
        <option value="desc">Descending</option>
        <option value="asc">Ascending</option>
      </select>

      <div className="filters-spacer" />

      {hasActiveFilters && (
        <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
          ✕ Clear filters
        </button>
      )}
    </div>
  );
}
