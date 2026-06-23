import { OpportunityStage } from '@prisma/client';

export type RiskLabel = 'late' | 'stagnant' | null;

const CLOSED_STAGES: OpportunityStage[] = [
  OpportunityStage.WON,
  OpportunityStage.LOST,
];

/**
 * Computes the risk label for an opportunity.
 *
 * Rules (from decisions.md):
 *  - "late"     → expectedSignatureDate is in the past AND stage is not WON/LOST
 *  - "stagnant" → lastStageChangeAt > STAGNANT_THRESHOLD_DAYS days ago AND stage is not WON/LOST
 *  - Priority   → "late" wins over "stagnant"
 *  - No label   → closed (WON/LOST) or neither condition applies
 */
export function computeRiskLabel(opp: {
  stage: OpportunityStage;
  expectedSignatureDate: Date;
  lastStageChangeAt: Date;
}): RiskLabel {
  if (CLOSED_STAGES.includes(opp.stage)) return null;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const expectedDate = new Date(opp.expectedSignatureDate);
  const signatureDay = new Date(
    expectedDate.getFullYear(),
    expectedDate.getMonth(),
    expectedDate.getDate(),
  );

  const isLate = signatureDay < today;

  const thresholdDays = parseInt(
    process.env.STAGNANT_THRESHOLD_DAYS ?? '14',
    10,
  );
  const thresholdMs = thresholdDays * 24 * 60 * 60 * 1000;
  const isStagnant = now.getTime() - opp.lastStageChangeAt.getTime() > thresholdMs;

  if (isLate) return 'late';
  if (isStagnant) return 'stagnant';
  return null;
}
