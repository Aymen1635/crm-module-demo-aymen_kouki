import type { PipelineSummary as PipelineSummaryType } from '@/lib/types';
import { formatCurrencyShort, STAGE_LABELS, STAGE_COLORS } from '@/lib/utils';
import type { OpportunityStage } from '@/lib/types';

interface PipelineSummaryProps {
  summary: PipelineSummaryType;
}

const ACTIVE_STAGES: OpportunityStage[] = ['LEAD', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION'];

export function PipelineSummary({ summary }: PipelineSummaryProps) {
  const activeStages = summary.stages.filter((s) =>
    ACTIVE_STAGES.includes(s.stage),
  );

  const maxAmount = Math.max(...activeStages.map((s) => s.totalAmountCents), 1);

  return (
    <div>
      {/* Top KPIs */}
      <div className="pipeline-banner">
        <div className="pipeline-stat">
          <div className="pipeline-stat-label">Active pipeline</div>
          <div className="pipeline-stat-value">
            {formatCurrencyShort(summary.totalActiveCents)}
          </div>
          <div className="pipeline-stat-sub">
            {summary.stages
              .filter((s) => ACTIVE_STAGES.includes(s.stage))
              .reduce((acc, s) => acc + s.count, 0)}{' '}
            open deals
          </div>
        </div>

        <div className={`pipeline-stat ${summary.atRiskCount > 0 ? 'danger' : ''}`}>
          <div className="pipeline-stat-label">At risk (late)</div>
          <div className="pipeline-stat-value">
            {formatCurrencyShort(summary.atRiskCents)}
          </div>
          <div className="pipeline-stat-sub">{summary.atRiskCount} deal{summary.atRiskCount !== 1 ? 's' : ''}</div>
        </div>

        {summary.stages
          .filter((s) => s.stage === 'WON' || s.stage === 'LOST')
          .map((s) => (
            <div key={s.stage} className="pipeline-stat">
              <div className="pipeline-stat-label">{STAGE_LABELS[s.stage]}</div>
              <div
                className="pipeline-stat-value"
                style={{ color: STAGE_COLORS[s.stage] }}
              >
                {formatCurrencyShort(s.totalAmountCents)}
              </div>
              <div className="pipeline-stat-sub">{s.count} deal{s.count !== 1 ? 's' : ''}</div>
            </div>
          ))}
      </div>

      {/* Stage bars */}
      <div className="pipeline-stage-bars">
        {activeStages.map((s) => {
          const pct = maxAmount > 0 ? (s.totalAmountCents / maxAmount) * 100 : 0;
          return (
            <div key={s.stage} className="stage-bar-item">
              <div className="stage-bar-label">
                <span>{STAGE_LABELS[s.stage]}</span>
                <span>{s.count}</span>
              </div>
              <div className="stage-bar-track">
                <div
                  className="stage-bar-fill"
                  style={{
                    width: `${pct}%`,
                    background: STAGE_COLORS[s.stage],
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
