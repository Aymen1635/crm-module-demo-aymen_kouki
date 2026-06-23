import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { fetchOpportunities, fetchPipelineSummary } from '@/lib/api';
import { OpportunityTable } from '@/components/opportunities/OpportunityTable';
import { OpportunityFilters } from '@/components/opportunities/OpportunityFilters';
import { Pagination } from '@/components/opportunities/Pagination';
import { PipelineSummary } from '@/components/pipeline/PipelineSummary';

export const metadata: Metadata = {
  title: 'Opportunities',
  description: 'Browse and manage your sales opportunities',
};

// Next.js 15: searchParams is a Promise
interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function getString(
  val: string | string[] | undefined,
  fallback = '',
): string {
  if (Array.isArray(val)) return val[0] ?? fallback;
  return val ?? fallback;
}

export default async function OpportunitiesPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const stage = getString(params.stage);
  const clientType = getString(params.clientType);
  const sortBy = getString(params.sortBy, 'createdAt');
  const order = getString(params.order, 'desc');
  const page = parseInt(getString(params.page, '1'), 10);
  const limit = 20;

  // Build query params for API
  const apiParams: Record<string, string> = {
    sortBy,
    order,
    page: String(page),
    limit: String(limit),
  };
  if (stage) apiParams.stage = stage;
  if (clientType) apiParams.clientType = clientType;

  // Fetch both in parallel
  const [result, pipeline] = await Promise.all([
    fetchOpportunities(apiParams),
    fetchPipelineSummary(),
  ]);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Opportunities</h1>
          <p className="page-subtitle">
            {result.meta.total} deal{result.meta.total !== 1 ? 's' : ''} in your pipeline
          </p>
        </div>
        <Link href="/opportunities/new" className="btn btn-primary">
          + New opportunity
        </Link>
      </div>

      {/* Pipeline summary banner */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <span className="card-title">Pipeline overview</span>
        </div>
        <PipelineSummary summary={pipeline} />
      </div>

      {/* Filters — client component wrapped in Suspense for useSearchParams */}
      <Suspense fallback={<div className="filters-bar"><span className="text-muted text-sm">Loading filters…</span></div>}>
        <OpportunityFilters />
      </Suspense>

      {/* Table */}
      <OpportunityTable opportunities={result.data} />

      {/* Pagination — client component wrapped in Suspense */}
      <Suspense fallback={null}>
        <Pagination
          currentPage={page}
          totalPages={result.meta.totalPages}
          total={result.meta.total}
          limit={limit}
        />
      </Suspense>
    </div>
  );
}
