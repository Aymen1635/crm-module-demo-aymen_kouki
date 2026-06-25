"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PipelineService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const ALL_STAGES = Object.values(client_1.OpportunityStage);
const CLOSED_STAGES = [client_1.OpportunityStage.WON, client_1.OpportunityStage.LOST];
let PipelineService = class PipelineService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSummary() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const thresholdDays = parseInt(process.env.STAGNANT_THRESHOLD_DAYS ?? '14', 10);
        const stagnantCutoff = new Date(Date.now() - thresholdDays * 24 * 60 * 60 * 1000);
        const [stageAggregates, atRiskAgg, stagnantAgg] = await Promise.all([
            this.prisma.opportunity.groupBy({
                by: ['stage'],
                where: { deletedAt: null },
                _count: { id: true },
                _sum: { amountCents: true },
            }),
            this.prisma.opportunity.aggregate({
                where: {
                    deletedAt: null,
                    stage: { notIn: CLOSED_STAGES },
                    expectedSignatureDate: { lt: today },
                },
                _count: { id: true },
                _sum: { amountCents: true },
            }),
            this.prisma.opportunity.aggregate({
                where: {
                    deletedAt: null,
                    stage: { notIn: CLOSED_STAGES },
                    expectedSignatureDate: { gte: today },
                    lastStageChangeAt: { lt: stagnantCutoff },
                },
                _count: { id: true },
                _sum: { amountCents: true },
            }),
        ]);
        const stageMap = new Map();
        for (const stage of ALL_STAGES) {
            stageMap.set(stage, { count: 0, totalAmountCents: 0 });
        }
        let totalActiveCents = 0;
        for (const agg of stageAggregates) {
            stageMap.set(agg.stage, {
                count: agg._count.id,
                totalAmountCents: agg._sum.amountCents ?? 0,
            });
            if (!CLOSED_STAGES.includes(agg.stage)) {
                totalActiveCents += agg._sum.amountCents ?? 0;
            }
        }
        const stages = ALL_STAGES.map((stage) => ({
            stage,
            ...stageMap.get(stage),
        }));
        return {
            stages,
            totalActiveCents,
            atRiskCents: atRiskAgg._sum.amountCents ?? 0,
            atRiskCount: atRiskAgg._count.id,
            stagnantCents: stagnantAgg._sum.amountCents ?? 0,
            stagnantCount: stagnantAgg._count.id,
        };
    }
};
exports.PipelineService = PipelineService;
exports.PipelineService = PipelineService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PipelineService);
//# sourceMappingURL=pipeline.service.js.map