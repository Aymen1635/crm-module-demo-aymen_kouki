import { PrismaService } from '../prisma/prisma.service';
export declare class PipelineService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getSummary(): Promise<{
        stages: {
            count: number;
            totalAmountCents: number;
            stage: "LEAD" | "QUALIFIED" | "PROPOSAL" | "NEGOTIATION" | "WON" | "LOST";
        }[];
        totalActiveCents: number;
        atRiskCents: number;
        atRiskCount: number;
        stagnantCents: number;
        stagnantCount: number;
    }>;
}
