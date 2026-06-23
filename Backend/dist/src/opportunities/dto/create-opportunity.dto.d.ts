import { OpportunityStage } from '@prisma/client';
export declare class CreateOpportunityDto {
    clientId: string;
    title: string;
    amountCents: number;
    currency?: string;
    expectedSignatureDate: string;
    stage?: OpportunityStage;
}
