import { PipelineService } from './pipeline.service';
export declare class PipelineController {
    private readonly pipelineService;
    constructor(pipelineService: PipelineService);
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
