import { OpportunityStage } from '@prisma/client';
import { computeRiskLabel } from './opportunity-risk.util';

describe('computeRiskLabel', () => {
  const originalEnv = process.env;
  let mockNow: number;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv, STAGNANT_THRESHOLD_DAYS: '14' };

    // Mock Date to a fixed point in time: 2026-06-25T12:00:00.000Z
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-06-25T12:00:00.000Z'));
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.useRealTimers();
  });

  it('should return null for closed stages (WON/LOST) regardless of dates', () => {
    const oppWon = {
      stage: OpportunityStage.WON,
      expectedSignatureDate: new Date('2020-01-01T00:00:00.000Z'), // Very late
      lastStageChangeAt: new Date('2020-01-01T00:00:00.000Z'), // Very stagnant
    };
    expect(computeRiskLabel(oppWon)).toBeNull();

    const oppLost = {
      stage: OpportunityStage.LOST,
      expectedSignatureDate: new Date('2020-01-01T00:00:00.000Z'), // Very late
      lastStageChangeAt: new Date('2020-01-01T00:00:00.000Z'), // Very stagnant
    };
    expect(computeRiskLabel(oppLost)).toBeNull();
  });

  it('should return null if not late and not stagnant', () => {
    const opp = {
      stage: OpportunityStage.NEGOTIATION,
      expectedSignatureDate: new Date('2026-06-30T00:00:00.000Z'), // Future
      lastStageChangeAt: new Date('2026-06-20T00:00:00.000Z'), // 5 days ago (not > 14)
    };
    expect(computeRiskLabel(opp)).toBeNull();
  });

  it('should return "late" if expectedSignatureDate is in the past', () => {
    const opp = {
      stage: OpportunityStage.NEGOTIATION,
      expectedSignatureDate: new Date('2026-06-20T00:00:00.000Z'), // Past
      lastStageChangeAt: new Date('2026-06-20T00:00:00.000Z'), // 5 days ago
    };
    expect(computeRiskLabel(opp)).toBe('late');
  });

  it('should return "stagnant" if lastStageChangeAt > threshold days ago', () => {
    const opp = {
      stage: OpportunityStage.PROPOSAL,
      expectedSignatureDate: new Date('2026-06-30T00:00:00.000Z'), // Future
      lastStageChangeAt: new Date('2026-06-01T00:00:00.000Z'), // 24 days ago (> 14)
    };
    expect(computeRiskLabel(opp)).toBe('stagnant');
  });

  it('should prioritize "late" over "stagnant" when both apply', () => {
    const opp = {
      stage: OpportunityStage.QUALIFIED,
      expectedSignatureDate: new Date('2026-06-01T00:00:00.000Z'), // Late
      lastStageChangeAt: new Date('2026-06-01T00:00:00.000Z'), // Stagnant
    };
    expect(computeRiskLabel(opp)).toBe('late');
  });
});
