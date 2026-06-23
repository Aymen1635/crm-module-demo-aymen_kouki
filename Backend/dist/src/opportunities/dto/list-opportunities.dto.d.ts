import { ClientType, OpportunityStage } from '@prisma/client';
export type SortField = 'createdAt' | 'amountCents' | 'expectedSignatureDate' | 'stage';
export type SortOrder = 'asc' | 'desc';
export declare class ListOpportunitiesDto {
    stage?: OpportunityStage;
    clientType?: ClientType;
    sortBy?: SortField;
    order?: SortOrder;
    page?: number;
    limit?: number;
}
