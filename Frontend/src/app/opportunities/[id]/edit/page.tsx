import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchOpportunity } from '@/lib/api';
import { OpportunityForm } from '@/components/opportunities/OpportunityForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const opp = await fetchOpportunity(id);
    return { title: `Edit — ${opp.title}` };
  } catch {
    return { title: 'Edit opportunity' };
  }
}

export default async function EditOpportunityPage({ params }: PageProps) {
  const { id } = await params;

  let opp;
  try {
    opp = await fetchOpportunity(id);
  } catch {
    notFound();
  }

  return (
    <div className="fade-in">
      <div className="breadcrumb">
        <Link href="/opportunities">Opportunities</Link>
        <span className="breadcrumb-sep">›</span>
        <Link href={`/opportunities/${opp.id}`}>{opp.title}</Link>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">Edit</span>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">Edit opportunity</h1>
          <p className="page-subtitle">Update the details of this deal.</p>
        </div>
      </div>

      <OpportunityForm opportunity={opp} />
    </div>
  );
}
