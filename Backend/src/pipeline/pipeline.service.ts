import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OpportunityStage } from '@prisma/client';

const ALL_STAGES = Object.values(OpportunityStage);
const CLOSED_STAGES = [OpportunityStage.WON, OpportunityStage.LOST];

@Injectable()
export class PipelineService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thresholdDays = parseInt(
      process.env.STAGNANT_THRESHOLD_DAYS ?? '14',
      10,
    );
    const stagnantCutoff = new Date(
      Date.now() - thresholdDays * 24 * 60 * 60 * 1000,
    );

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

    const stageMap = new Map<
      OpportunityStage,
      { count: number; totalAmountCents: number }
    >();
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
      ...stageMap.get(stage)!,
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
}
