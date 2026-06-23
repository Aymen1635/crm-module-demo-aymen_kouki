'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { OpportunityListItem } from '@/lib/types';
import {
  formatCurrency,
  formatDate,
  getClientDisplayName,
  STAGE_LABELS,
  STAGE_BADGE_CLASS,
  CLIENT_TYPE_BADGE_CLASS,
  CLIENT_TYPE_LABELS,
} from '@/lib/utils';
import { RiskBadge } from './RiskBadge';

interface OpportunityTableProps {
  opportunities: OpportunityListItem[];
}

export function OpportunityTable({ opportunities }: OpportunityTableProps) {
  const router = useRouter();

  if (opportunities.length === 0) {
    return (
      <div className="table-wrapper">
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <div className="empty-state-title">No opportunities found</div>
          <div className="empty-state-desc">
            Try adjusting your filters, or{' '}
            <Link href="/opportunities/new" style={{ color: 'var(--color-accent)' }}>
              create a new opportunity
            </Link>
            .
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Opportunity</th>
            <th>Client</th>
            <th>Amount</th>
            <th>Stage</th>
            <th>Expected date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {opportunities.map((opp) => (
            <tr
              key={opp.id}
              onClick={() => router.push(`/opportunities/${opp.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <td>
                <div className="font-medium truncate" style={{ maxWidth: '240px' }}>
                  {opp.title}
                </div>
                <div
                  className="td-secondary"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}
                >
                  {opp.id.slice(0, 8)}…
                </div>
              </td>
              <td>
                <div className="font-medium">{getClientDisplayName(opp.client)}</div>
                <span
                  className={`badge badge-sm ${CLIENT_TYPE_BADGE_CLASS[opp.client.type]}`}
                  style={{ marginTop: '4px', display: 'inline-flex' }}
                >
                  {CLIENT_TYPE_LABELS[opp.client.type]}
                </span>
              </td>
              <td>
                <div className="font-semibold text-mono">
                  {formatCurrency(opp.amountCents, opp.currency)}
                </div>
              </td>
              <td>
                <span className={`badge ${STAGE_BADGE_CLASS[opp.stage]}`}>
                  {STAGE_LABELS[opp.stage]}
                </span>
              </td>
              <td>
                <div
                  className={opp.riskLabel === 'late' ? 'font-medium' : ''}
                  style={opp.riskLabel === 'late' ? { color: 'var(--color-danger)' } : {}}
                >
                  {formatDate(opp.expectedSignatureDate)}
                </div>
              </td>
              <td>
                <RiskBadge risk={opp.riskLabel} />
                {!opp.riskLabel && (
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
