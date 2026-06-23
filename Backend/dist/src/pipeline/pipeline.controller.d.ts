import { PipelineService } from './pipeline.service';
export declare class PipelineController {
    private readonly pipelineService;
    constructor(pipelineService: PipelineService);
    getSummary(): Promise<{
        stages: {
            count: number;
            totalAmountCents: number;
            stage: "PROPOSAL" | "NEGOTIATION" | "QUALIFIED" | "LEAD" | "WON" | "LOST";
        }[];
        totalActiveCents: number;
        atRiskCents: number;
        atRiskCount: number;
    }>;
}
