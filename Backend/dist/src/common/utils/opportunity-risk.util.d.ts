import { OpportunityStage } from '@prisma/client';
export type RiskLabel = 'late' | 'stagnant' | null;
export declare function computeRiskLabel(opp: {
    stage: OpportunityStage;
    expectedSignatureDate: Date;
    lastStageChangeAt: Date;
}): RiskLabel;
