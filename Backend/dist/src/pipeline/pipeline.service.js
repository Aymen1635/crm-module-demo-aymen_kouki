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
const opportunity_risk_util_1 = require("../common/utils/opportunity-risk.util");
const ALL_STAGES = Object.values(client_1.OpportunityStage);
let PipelineService = class PipelineService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSummary() {
        const activeOpportunities = await this.prisma.opportunity.findMany({
            where: { deletedAt: null },
            select: {
                stage: true,
                amountCents: true,
                expectedSignatureDate: true,
                lastStageChangeAt: true,
            },
        });
        const stageMap = new Map();
        for (const stage of ALL_STAGES) {
            stageMap.set(stage, { count: 0, totalAmountCents: 0 });
        }
        let totalActiveCents = 0;
        let atRiskCents = 0;
        let atRiskCount = 0;
        let stagnantCents = 0;
        let stagnantCount = 0;
        for (const opp of activeOpportunities) {
            const entry = stageMap.get(opp.stage);
            entry.count += 1;
            entry.totalAmountCents += opp.amountCents;
            if (opp.stage !== client_1.OpportunityStage.WON &&
                opp.stage !== client_1.OpportunityStage.LOST) {
                totalActiveCents += opp.amountCents;
            }
            const risk = (0, opportunity_risk_util_1.computeRiskLabel)(opp);
            if (risk === 'late') {
                atRiskCents += opp.amountCents;
                atRiskCount += 1;
            }
            else if (risk === 'stagnant') {
                stagnantCents += opp.amountCents;
                stagnantCount += 1;
            }
        }
        const stages = ALL_STAGES.map((stage) => ({
            stage,
            ...stageMap.get(stage),
        }));
        return {
            stages,
            totalActiveCents,
            atRiskCents,
            atRiskCount,
            stagnantCents,
            stagnantCount,
        };
    }
};
exports.PipelineService = PipelineService;
exports.PipelineService = PipelineService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PipelineService);
//# sourceMappingURL=pipeline.service.js.map