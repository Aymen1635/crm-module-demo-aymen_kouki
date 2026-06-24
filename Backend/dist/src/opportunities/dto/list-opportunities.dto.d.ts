import { ClientType, OpportunityStage } from '@prisma/client';
import type { RiskLabel } from '../../common/utils/opportunity-risk.util';
export type SortField = 'createdAt' | 'amountCents' | 'expectedSignatureDate' | 'stage';
export type SortOrder = 'asc' | 'desc';
export declare class ListOpportunitiesDto {
    stage?: OpportunityStage;
    clientType?: ClientType;
    riskLabel?: RiskLabel[];
    sortBy?: SortField;
    order?: SortOrder;
    page?: number;
    limit?: number;
}
