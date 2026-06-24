import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchOpportunity } from '@/lib/api';
import {
  formatCurrency,
  formatDate,
  getClientDisplayName,
  getClientInitials,
  STAGE_LABELS,
  STAGE_BADGE_CLASS,
  CLIENT_TYPE_LABELS,
  CLIENT_TYPE_BADGE_CLASS,
  getRiskDescription,
} from '@/lib/utils';
import { RiskBadge } from '@/components/opportunities/RiskBadge';
import { DeleteButton } from '@/components/opportunities/DeleteButton';

// Next.js 15: params is a Promise
interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const opp = await fetchOpportunity(id);
    return { title: opp.title };
  } catch {
    return { title: 'Opportunity not found' };
  }
}

export default async function OpportunityDetailPage({ params }: PageProps) {
  const { id } = await params;

  let opp;
  try {
    opp = await fetchOpportunity(id);
  } catch {
    notFound();
  }

  const clientDisplayName = getClientDisplayName(opp.client);
  const initials = getClientInitials(opp.client);
  const riskDesc = getRiskDescription(opp.riskLabel);

  return (
    <div className="fade-in">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link href="/opportunities">Opportunities</Link>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">{opp.title}</span>
      </div>

      <div className="detail-layout">
        {/* Left — main content */}
        <div>
          <div className="detail-header">
            <div>
              {opp.riskLabel && (
                <div
                  className={`risk-alert ${opp.riskLabel}`}
                  style={{ marginBottom: '12px' }}
                >
                  <span>{opp.riskLabel === 'late' ? '⚠️' : '🐌'}</span>
                  <span>{riskDesc}</span>
                </div>
              )}
              <h1 className="detail-title">{opp.title}</h1>
              <div className="flex items-center gap-3" style={{ marginTop: '10px' }}>
                <span className={`badge ${STAGE_BADGE_CLASS[opp.stage]}`}>
                  {STAGE_LABELS[opp.stage]}
                </span>
                <RiskBadge risk={opp.riskLabel} />
              </div>
            </div>

            <div className="detail-actions">
              <Link
                href={`/opportunities/${opp.id}/edit`}
                className="btn btn-secondary"
              >
                ✎ Edit
              </Link>
              {/* Client Component island — only this small piece is interactive */}
              <DeleteButton opportunityId={opp.id} />
            </div>
          </div>

          {/* Amount */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="card-header">
              <span className="card-title">Deal value</span>
              <span className="text-muted text-sm">{opp.currency}</span>
            </div>
            <div className="detail-amount">
              {formatCurrency(opp.amountCents, opp.currency)}
            </div>
          </div>

          {/* Meta grid */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Details</span>
            </div>
            <div className="detail-meta-grid">
              <div className="detail-meta-item">
                <div className="detail-meta-label">Stage</div>
                <div className="detail-meta-value">
                  <span className={`badge ${STAGE_BADGE_CLASS[opp.stage]}`}>
                    {STAGE_LABELS[opp.stage]}
                  </span>
                </div>
              </div>

              <div className="detail-meta-item">
                <div className="detail-meta-label">Expected signature</div>
                <div
                  className="detail-meta-value"
                  style={
                    opp.riskLabel === 'late' ? { color: 'var(--color-danger)' } : {}
                  }
                >
                  {formatDate(opp.expectedSignatureDate)}
                  {opp.riskLabel === 'late' && ' ⚠️'}
                </div>
              </div>

              <div className="detail-meta-item">
                <div className="detail-meta-label">Last stage change</div>
                <div
                  className="detail-meta-value"
                  style={
                    opp.riskLabel === 'stagnant'
                      ? { color: 'var(--color-warning)' }
                      : {}
                  }
                >
                  {formatDate(opp.lastStageChangeAt)}
                  {opp.riskLabel === 'stagnant' && ' 🐌'}
                </div>
              </div>

              <div className="detail-meta-item">
                <div className="detail-meta-label">Created</div>
                <div className="detail-meta-value">{formatDate(opp.createdAt)}</div>
              </div>

              <div className="detail-meta-item">
                <div className="detail-meta-label">Last updated</div>
                <div className="detail-meta-value">{formatDate(opp.updatedAt)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right — client sidebar */}
        <div>
          <div className="client-card">
            <div className="client-card-header">
              <div className="client-avatar">{initials}</div>
              <div>
                <div className="client-name">{clientDisplayName}</div>
                <span
                  className={`badge badge-sm ${CLIENT_TYPE_BADGE_CLASS[opp.client.type]}`}
                  style={{ marginTop: '4px', display: 'inline-flex' }}
                >
                  {CLIENT_TYPE_LABELS[opp.client.type]}
                </span>
              </div>
            </div>

            <div className="client-card-body">
              {opp.client.type === 'COMPANY' && opp.client.legalId && (
                <div className="client-detail-row">
                  <span className="client-detail-icon">🏢</span>
                  <div className="client-detail-content">
                    <div className="client-detail-label">Legal ID</div>
                    <div className="client-detail-value font-mono text-sm">{opp.client.legalId}</div>
                  </div>
                </div>
              )}

              {opp.client.email && (
                <div className="client-detail-row">
                  <span className="client-detail-icon">✉️</span>
                  <div className="client-detail-content">
                    <div className="client-detail-label">Email</div>
                    <a
                      href={`mailto:${opp.client.email}`}
                      className="client-detail-value"
                      style={{ color: 'var(--color-accent)' }}
                    >
                      {opp.client.email}
                    </a>
                  </div>
                </div>
              )}

              {opp.client.phone && (
                <div className="client-detail-row">
                  <span className="client-detail-icon">📞</span>
                  <div className="client-detail-content">
                    <div className="client-detail-label">Phone</div>
                    <div className="client-detail-value">{opp.client.phone}</div>
                  </div>
                </div>
              )}

              {opp.client.address && (
                <div className="client-detail-row">
                  <span className="client-detail-icon">📍</span>
                  <div className="client-detail-content">
                    <div className="client-detail-label">Address</div>
                    <div className="client-detail-value">{opp.client.address}</div>
                  </div>
                </div>
              )}

              {opp.client.notes && (
                <div className="client-detail-row">
                  <span className="client-detail-icon">📝</span>
                  <div className="client-detail-content">
                    <div className="client-detail-label">Notes</div>
                    <div
                      className="client-detail-value"
                      style={{ fontSize: '13px', color: 'var(--text-secondary)' }}
                    >
                      {opp.client.notes}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
