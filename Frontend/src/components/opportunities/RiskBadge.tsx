import type { RiskLabel } from '@/lib/types';
import { getRiskLabel, getRiskBadgeClass } from '@/lib/utils';

interface RiskBadgeProps {
  risk: RiskLabel;
}

export function RiskBadge({ risk }: RiskBadgeProps) {
  if (!risk) return null;

  const label = getRiskLabel(risk);
  const cls = getRiskBadgeClass(risk);
  const icon = risk === 'late' ? '⚠️' : '🐌';

  return (
    <span className={`badge ${cls}`}>
      {icon} {label}
    </span>
  );
}
