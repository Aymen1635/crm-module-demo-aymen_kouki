import { OpportunitiesService } from './opportunities.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { ListOpportunitiesDto } from './dto/list-opportunities.dto';
export declare class OpportunitiesController {
    private readonly opportunitiesService;
    constructor(opportunitiesService: OpportunitiesService);
    findAll(query: ListOpportunitiesDto): Promise<import("../common/types/paginated.type").PaginatedResult<{
        riskLabel: import("../common/utils/opportunity-risk.util").RiskLabel;
        id: string;
        title: string;
        amountCents: number;
        currency: string;
        expectedSignatureDate: Date;
        stage: import(".prisma/client").$Enums.OpportunityStage;
        lastStageChangeAt: Date;
        createdAt: Date;
        updatedAt: Date;
        client: {
            id: string;
            type: import(".prisma/client").$Enums.ClientType;
            companyName: string | null;
            legalId: string | null;
            firstName: string | null;
            lastName: string | null;
            email: string;
        };
    }>>;
    findOne(id: string): Promise<{
        riskLabel: import("../common/utils/opportunity-risk.util").RiskLabel;
        id: string;
        title: string;
        amountCents: number;
        currency: string;
        expectedSignatureDate: Date;
        stage: import(".prisma/client").$Enums.OpportunityStage;
        lastStageChangeAt: Date;
        createdAt: Date;
        updatedAt: Date;
        client: {
            id: string;
            type: import(".prisma/client").$Enums.ClientType;
            companyName: string | null;
            legalId: string | null;
            firstName: string | null;
            lastName: string | null;
            email: string;
            phone: string | null;
            address: string | null;
            notes: string | null;
        };
    }>;
    create(dto: CreateOpportunityDto): Promise<{
        riskLabel: import("../common/utils/opportunity-risk.util").RiskLabel;
        id: string;
        title: string;
        amountCents: number;
        currency: string;
        expectedSignatureDate: Date;
        stage: import(".prisma/client").$Enums.OpportunityStage;
        lastStageChangeAt: Date;
        createdAt: Date;
        updatedAt: Date;
        client: {
            id: string;
            type: import(".prisma/client").$Enums.ClientType;
            companyName: string | null;
            legalId: string | null;
            firstName: string | null;
            lastName: string | null;
            email: string;
        };
    }>;
    update(id: string, dto: UpdateOpportunityDto): Promise<{
        riskLabel: import("../common/utils/opportunity-risk.util").RiskLabel;
        id: string;
        title: string;
        amountCents: number;
        currency: string;
        expectedSignatureDate: Date;
        stage: import(".prisma/client").$Enums.OpportunityStage;
        lastStageChangeAt: Date;
        createdAt: Date;
        updatedAt: Date;
        client: {
            id: string;
            type: import(".prisma/client").$Enums.ClientType;
            companyName: string | null;
            legalId: string | null;
            firstName: string | null;
            lastName: string | null;
            email: string;
        };
    }>;
    remove(id: string): Promise<void>;
}
