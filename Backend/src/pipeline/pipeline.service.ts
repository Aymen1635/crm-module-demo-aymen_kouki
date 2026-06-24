import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OpportunityStage } from '@prisma/client';
import { computeRiskLabel } from '../common/utils/opportunity-risk.util';

const ALL_STAGES = Object.values(OpportunityStage);

@Injectable()
export class PipelineService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    // ⚠️ Scalability note: we currently load all active opportunities into memory
    // to compute risk labels (which depend on Date comparisons + env config).
    // For a production dataset (100k+ records), the stage aggregation should
    // move to a Prisma `groupBy` or raw SQL, and risk computation should be
    // handled via a database query with date filters.
    const activeOpportunities = await this.prisma.opportunity.findMany({
      where: { deletedAt: null },
      select: {
        stage: true,
        amountCents: true,
        expectedSignatureDate: true,
        lastStageChangeAt: true,
      },
    });

    // Aggregate by stage
    const stageMap = new Map<
      OpportunityStage,
      { count: number; totalAmountCents: number }
    >();

    for (const stage of ALL_STAGES) {
      stageMap.set(stage, { count: 0, totalAmountCents: 0 });
    }

    let totalActiveCents = 0;
    let atRiskCents = 0;
    let atRiskCount = 0;
    let stagnantCents = 0;
    let stagnantCount = 0;

    for (const opp of activeOpportunities) {
      const entry = stageMap.get(opp.stage)!;
      entry.count += 1;
      entry.totalAmountCents += opp.amountCents;

      // Accumulate active total (exclude WON/LOST)
      if (
        opp.stage !== OpportunityStage.WON &&
        opp.stage !== OpportunityStage.LOST
      ) {
        totalActiveCents += opp.amountCents;
      }

      const risk = computeRiskLabel(opp);
      if (risk === 'late') {
        atRiskCents += opp.amountCents;
        atRiskCount += 1;
      } else if (risk === 'stagnant') {
        stagnantCents += opp.amountCents;
        stagnantCount += 1;
      }
    }

    const stages = ALL_STAGES.map((stage) => ({
      stage,
      ...stageMap.get(stage)!,
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
}
