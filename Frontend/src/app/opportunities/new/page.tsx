import type { Metadata } from 'next';
import Link from 'next/link';
import { OpportunityForm } from '@/components/opportunities/OpportunityForm';

export const metadata: Metadata = {
  title: 'New opportunity',
  description: 'Create a new sales opportunity',
};

export default function NewOpportunityPage() {
  return (
    <div className="fade-in">
      <div className="breadcrumb">
        <Link href="/opportunities">Opportunities</Link>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">New opportunity</span>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">New opportunity</h1>
          <p className="page-subtitle">Fill in the details below to add a deal to your pipeline.</p>
        </div>
      </div>

      <OpportunityForm />
    </div>
  );
}
