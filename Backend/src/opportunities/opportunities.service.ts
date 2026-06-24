import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { ListOpportunitiesDto } from './dto/list-opportunities.dto';
import { paginate } from '../common/types/paginated.type';
import { computeRiskLabel } from '../common/utils/opportunity-risk.util';
import { Prisma, OpportunityStage } from '@prisma/client';

// Fields we always select on an opportunity to compute risk and display info
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
} satisfies Prisma.OpportunitySelect;

type OpportunityWithClient = Prisma.OpportunityGetPayload<{
  select: typeof OPPORTUNITY_SELECT;
}>;

function toResponse(opp: OpportunityWithClient) {
  return {
    ...opp,
    riskLabel: computeRiskLabel(opp),
  };
}

@Injectable()
export class OpportunitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListOpportunitiesDto) {
    const {
      stage,
      clientType,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 20,
    } = query;

    const where: Prisma.OpportunityWhereInput = {
      deletedAt: null,
      ...(stage ? { stage } : {}),
      ...(clientType ? { client: { type: clientType, deletedAt: null } } : {}),
    };

    // Validate sortBy to prevent injection
    const allowedSortFields: Record<string, Prisma.OpportunityOrderByWithRelationInput> = {
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

    return paginate(items.map(toResponse), total, page, limit);
  }

  async findOne(id: string) {
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
      throw new NotFoundException(`Opportunity ${id} not found`);
    }

    return { ...opp, riskLabel: computeRiskLabel(opp) };
  }

  async create(dto: CreateOpportunityDto) {
    // Verify client exists
    const client = await this.prisma.client.findFirst({
      where: { id: dto.clientId, deletedAt: null },
    });
    if (!client) {
      throw new NotFoundException(`Client ${dto.clientId} not found`);
    }

    const opp = await this.prisma.opportunity.create({
      data: {
        clientId: dto.clientId,
        title: dto.title,
        amountCents: dto.amountCents,
        currency: dto.currency ?? 'EUR',
        expectedSignatureDate: new Date(dto.expectedSignatureDate),
        stage: dto.stage ?? OpportunityStage.LEAD,
        lastStageChangeAt: new Date(),
      },
      select: OPPORTUNITY_SELECT,
    });

    return toResponse(opp);
  }

  async update(id: string, dto: UpdateOpportunityDto) {
    const existing = await this.prisma.opportunity.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) {
      throw new NotFoundException(`Opportunity ${id} not found`);
    }

    // Auto-update lastStageChangeAt when stage changes
    const stageChanged =
      dto.stage !== undefined && dto.stage !== existing.stage;

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

  async remove(id: string) {
    const existing = await this.prisma.opportunity.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) {
      throw new NotFoundException(`Opportunity ${id} not found`);
    }

    await this.prisma.opportunity.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
