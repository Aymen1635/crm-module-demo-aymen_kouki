'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import type { PipelineSummary } from '@/lib/types';

interface AtRiskBarProps {
  summary: PipelineSummary;
}

export function AtRiskBar({ summary }: AtRiskBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeRiskLabels = searchParams?.getAll('riskLabel') ?? [];
  const total = summary.atRiskCount + summary.stagnantCount;

  // Disappears when there is nothing to flag, or when the user already filtered by risk
  if (total === 0 || activeRiskLabels.length > 0) return null;

  function applyFilter(labels: string[]) {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    params.delete('riskLabel');
    labels.forEach((l) => params.append('riskLabel', l));
    params.delete('page');
    router.push(`${pathname ?? '/opportunities'}?${params.toString()}`);
  }

  return (
    <div className="at-risk-bar" role="alert">
      <span className="at-risk-bar-icon">⚠</span>
      <span className="at-risk-bar-text">
        {total} deal{total !== 1 ? 's' : ''} need attention —
      </span>

      {summary.atRiskCount > 0 && (
        <button
          type="button"
          className="at-risk-bar-link danger"
          onClick={() => applyFilter(['late'])}
        >
          {summary.atRiskCount} overdue
        </button>
      )}

      {summary.atRiskCount > 0 && summary.stagnantCount > 0 && (
        <span className="at-risk-bar-sep">·</span>
      )}

      {summary.stagnantCount > 0 && (
        <button
          type="button"
          className="at-risk-bar-link warning"
          onClick={() => applyFilter(['stagnant'])}
        >
          {summary.stagnantCount} stagnant
        </button>
      )}

      {summary.atRiskCount > 0 && summary.stagnantCount > 0 && (
        <>
          <span className="at-risk-bar-sep">—</span>
          <button
            type="button"
            className="at-risk-bar-link"
            onClick={() => applyFilter(['late', 'stagnant'])}
          >
            View all
          </button>
        </>
      )}
    </div>
  );
}
