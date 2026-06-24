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
exports.OpportunitiesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const paginated_type_1 = require("../common/types/paginated.type");
const opportunity_risk_util_1 = require("../common/utils/opportunity-risk.util");
const client_1 = require("@prisma/client");
const OPPORTUNITY_SELECT = {
    id: true,
    title: true,
    amountCents: true,
    currency: true,
    stage: true,
    expectedSignatureDate: true,
    lastStageChangeAt: true,
    createdAt: true,
    updatedAt: true,
    client: {
        select: {
            id: true,
            type: true,
            companyName: true,
            legalId: true,
            firstName: true,
            lastName: true,
            email: true,
        },
    },
};
function toResponse(opp) {
    return {
        ...opp,
        riskLabel: (0, opportunity_risk_util_1.computeRiskLabel)(opp),
    };
}
let OpportunitiesService = class OpportunitiesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const { stage, clientType, riskLabel, sortBy = 'createdAt', order = 'desc', page = 1, limit = 20, } = query;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const thresholdDays = parseInt(process.env.STAGNANT_THRESHOLD_DAYS ?? '14', 10);
        const stagnantCutoff = new Date(Date.now() - thresholdDays * 24 * 60 * 60 * 1000);
        const closedStages = [client_1.OpportunityStage.WON, client_1.OpportunityStage.LOST];
        const where = {
            deletedAt: null,
            ...(stage ? { stage } : {}),
            ...(clientType ? { client: { type: clientType, deletedAt: null } } : {}),
        };
        if (riskLabel?.length) {
            const riskConditions = [];
            if (riskLabel.includes('late')) {
                riskConditions.push({
                    expectedSignatureDate: { lt: today },
                    stage: { notIn: closedStages },
                });
            }
            if (riskLabel.includes('stagnant')) {
                riskConditions.push({
                    lastStageChangeAt: { lt: stagnantCutoff },
                    expectedSignatureDate: { gte: today },
                    stage: { notIn: closedStages },
                });
            }
            where.AND =
                riskConditions.length === 1
                    ? riskConditions
                    : [{ OR: riskConditions }];
        }
        const allowedSortFields = {
            createdAt: { createdAt: order },
            amountCents: { amountCents: order },
            expectedSignatureDate: { expectedSignatureDate: order },
            stage: { stage: order },
        };
        const orderBy = allowedSortFields[sortBy] ?? { createdAt: order };
        const [total, items] = await Promise.all([
            this.prisma.opportunity.count({ where }),
            this.prisma.opportunity.findMany({
                where,
                select: OPPORTUNITY_SELECT,
                orderBy,
                skip: (page - 1) * limit,
                take: limit,
            }),
        ]);
        return (0, paginated_type_1.paginate)(items.map(toResponse), total, page, limit);
    }
    async findOne(id) {
        const opp = await this.prisma.opportunity.findFirst({
            where: { id, deletedAt: null },
            select: {
                ...OPPORTUNITY_SELECT,
                client: {
                    select: {
                        id: true,
                        type: true,
                        companyName: true,
                        legalId: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                        address: true,
                        notes: true,
                    },
                },
            },
        });
        if (!opp) {
            throw new common_1.NotFoundException(`Opportunity ${id} not found`);
        }
        return { ...opp, riskLabel: (0, opportunity_risk_util_1.computeRiskLabel)(opp) };
    }
    async create(dto) {
        const client = await this.prisma.client.findFirst({
            where: { id: dto.clientId, deletedAt: null },
        });
        if (!client) {
            throw new common_1.NotFoundException(`Client ${dto.clientId} not found`);
        }
        const opp = await this.prisma.opportunity.create({
            data: {
                clientId: dto.clientId,
                title: dto.title,
                amountCents: dto.amountCents,
                currency: dto.currency ?? 'EUR',
                expectedSignatureDate: new Date(dto.expectedSignatureDate),
                stage: dto.stage ?? client_1.OpportunityStage.LEAD,
                lastStageChangeAt: new Date(),
            },
            select: OPPORTUNITY_SELECT,
        });
        return toResponse(opp);
    }
    async update(id, dto) {
        const existing = await this.prisma.opportunity.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Opportunity ${id} not found`);
        }
        const stageChanged = dto.stage !== undefined && dto.stage !== existing.stage;
        const opp = await this.prisma.opportunity.update({
            where: { id },
            data: {
                ...(dto.clientId !== undefined && { clientId: dto.clientId }),
                ...(dto.title !== undefined && { title: dto.title }),
                ...(dto.amountCents !== undefined && { amountCents: dto.amountCents }),
                ...(dto.currency !== undefined && { currency: dto.currency }),
                ...(dto.expectedSignatureDate !== undefined && {
                    expectedSignatureDate: new Date(dto.expectedSignatureDate),
                }),
                ...(dto.stage !== undefined && { stage: dto.stage }),
                ...(stageChanged && { lastStageChangeAt: new Date() }),
            },
            select: OPPORTUNITY_SELECT,
        });
        return toResponse(opp);
    }
    async remove(id) {
        const existing = await this.prisma.opportunity.findFirst({
            where: { id, deletedAt: null },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Opportunity ${id} not found`);
        }
        await this.prisma.opportunity.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
};
exports.OpportunitiesService = OpportunitiesService;
exports.OpportunitiesService = OpportunitiesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OpportunitiesService);
//# sourceMappingURL=opportunities.service.js.map