import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { OpportunitiesService } from './opportunities.service';
import { PrismaService } from '../prisma/prisma.service';
import { OpportunityStage, ClientType } from '@prisma/client';

/* ─── Helpers ────────────────────────────────────────────────────── */

const mockClient = {
  id: '11111111-1111-1111-1111-111111111111',
  type: ClientType.COMPANY,
  companyName: 'Acme Corp',
  legalId: 'FR12345678901234',
  firstName: null,
  lastName: null,
  email: 'contact@acme.com',
  phone: '+33 1 23 45 67 89',
  address: '12 Rue de la Paix',
  notes: null,
  deletedAt: null,
  createdAt: new Date('2026-06-01'),
  updatedAt: new Date('2026-06-01'),
};

const mockOpportunity = {
  id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  clientId: mockClient.id,
  title: 'Enterprise License',
  amountCents: 150000,
  currency: 'EUR',
  stage: OpportunityStage.PROPOSAL,
  expectedSignatureDate: new Date('2026-07-15'),
  lastStageChangeAt: new Date('2026-06-20'),
  deletedAt: null,
  createdAt: new Date('2026-06-10'),
  updatedAt: new Date('2026-06-20'),
};

const mockOpportunityWithClient = {
  ...mockOpportunity,
  client: {
    id: mockClient.id,
    type: mockClient.type,
    companyName: mockClient.companyName,
    legalId: mockClient.legalId,
    firstName: mockClient.firstName,
    lastName: mockClient.lastName,
    email: mockClient.email,
  },
};

/* ─── Mock Prisma ────────────────────────────────────────────────── */

function createMockPrisma() {
  return {
    opportunity: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    client: {
      findFirst: jest.fn(),
    },
  };
}

/* ─── Tests ──────────────────────────────────────────────────────── */

describe('OpportunitiesService', () => {
  let service: OpportunitiesService;
  let prisma: ReturnType<typeof createMockPrisma>;

  beforeEach(async () => {
    prisma = createMockPrisma();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpportunitiesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<OpportunitiesService>(OpportunitiesService);
  });

  /* ─── findAll ─────────────────────────────────────────────────── */

  describe('findAll', () => {
    it('should return paginated results with risk labels', async () => {
      prisma.opportunity.count.mockResolvedValue(1);
      prisma.opportunity.findMany.mockResolvedValue([mockOpportunityWithClient]);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toHaveProperty('riskLabel');
      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
    });

    it('should pass stage filter to Prisma query', async () => {
      prisma.opportunity.count.mockResolvedValue(0);
      prisma.opportunity.findMany.mockResolvedValue([]);

      await service.findAll({ stage: OpportunityStage.WON, page: 1, limit: 20 });

      const countCall = prisma.opportunity.count.mock.calls[0][0];
      expect(countCall.where.stage).toBe(OpportunityStage.WON);
    });

    it('should pass clientType filter to Prisma query', async () => {
      prisma.opportunity.count.mockResolvedValue(0);
      prisma.opportunity.findMany.mockResolvedValue([]);

      await service.findAll({
        clientType: ClientType.COMPANY,
        page: 1,
        limit: 20,
      });

      const countCall = prisma.opportunity.count.mock.calls[0][0];
      expect(countCall.where.client).toEqual({
        type: ClientType.COMPANY,
        deletedAt: null,
      });
    });

    it('should use default sorting by createdAt desc', async () => {
      prisma.opportunity.count.mockResolvedValue(0);
      prisma.opportunity.findMany.mockResolvedValue([]);

      await service.findAll({ page: 1, limit: 20 });

      const findCall = prisma.opportunity.findMany.mock.calls[0][0];
      expect(findCall.orderBy).toEqual({ createdAt: 'desc' });
    });

    it('should calculate correct skip/take for pagination', async () => {
      prisma.opportunity.count.mockResolvedValue(0);
      prisma.opportunity.findMany.mockResolvedValue([]);

      await service.findAll({ page: 3, limit: 10 });

      const findCall = prisma.opportunity.findMany.mock.calls[0][0];
      expect(findCall.skip).toBe(20); // (3-1) * 10
      expect(findCall.take).toBe(10);
    });
  });

  /* ─── findOne ─────────────────────────────────────────────────── */

  describe('findOne', () => {
    it('should return the opportunity with its client and risk label', async () => {
      prisma.opportunity.findFirst.mockResolvedValue(mockOpportunityWithClient);

      const result = await service.findOne(mockOpportunity.id);

      expect(result.id).toBe(mockOpportunity.id);
      expect(result.client).toBeDefined();
      expect(result).toHaveProperty('riskLabel');
    });

    it('should throw NotFoundException when opportunity does not exist', async () => {
      prisma.opportunity.findFirst.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  /* ─── create ──────────────────────────────────────────────────── */

  describe('create', () => {
    it('should create an opportunity with valid data', async () => {
      prisma.client.findFirst.mockResolvedValue(mockClient);
      prisma.opportunity.create.mockResolvedValue(mockOpportunityWithClient);

      const result = await service.create({
        clientId: mockClient.id,
        title: 'New Deal',
        amountCents: 50000,
        expectedSignatureDate: '2026-08-01',
      });

      expect(result).toHaveProperty('riskLabel');
      expect(prisma.opportunity.create).toHaveBeenCalledTimes(1);

      const createCall = prisma.opportunity.create.mock.calls[0][0];
      expect(createCall.data.clientId).toBe(mockClient.id);
      expect(createCall.data.title).toBe('New Deal');
      expect(createCall.data.amountCents).toBe(50000);
      expect(createCall.data.stage).toBe(OpportunityStage.LEAD);
    });

    it('should throw NotFoundException if client does not exist', async () => {
      prisma.client.findFirst.mockResolvedValue(null);

      await expect(
        service.create({
          clientId: 'nonexistent-id',
          title: 'New Deal',
          amountCents: 50000,
          expectedSignatureDate: '2026-08-01',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should use custom stage and currency when provided', async () => {
      prisma.client.findFirst.mockResolvedValue(mockClient);
      prisma.opportunity.create.mockResolvedValue(mockOpportunityWithClient);

      await service.create({
        clientId: mockClient.id,
        title: 'USD Deal',
        amountCents: 100000,
        currency: 'USD',
        expectedSignatureDate: '2026-08-01',
        stage: OpportunityStage.NEGOTIATION,
      });

      const createCall = prisma.opportunity.create.mock.calls[0][0];
      expect(createCall.data.currency).toBe('USD');
      expect(createCall.data.stage).toBe(OpportunityStage.NEGOTIATION);
    });
  });

  /* ─── update ──────────────────────────────────────────────────── */

  describe('update', () => {
    it('should update lastStageChangeAt when stage changes', async () => {
      prisma.opportunity.findFirst.mockResolvedValue(mockOpportunity);
      prisma.opportunity.update.mockResolvedValue(mockOpportunityWithClient);

      await service.update(mockOpportunity.id, {
        stage: OpportunityStage.NEGOTIATION,
      });

      const updateCall = prisma.opportunity.update.mock.calls[0][0];
      expect(updateCall.data.stage).toBe(OpportunityStage.NEGOTIATION);
      expect(updateCall.data.lastStageChangeAt).toBeInstanceOf(Date);
    });

    it('should NOT update lastStageChangeAt when stage stays the same', async () => {
      prisma.opportunity.findFirst.mockResolvedValue(mockOpportunity);
      prisma.opportunity.update.mockResolvedValue(mockOpportunityWithClient);

      await service.update(mockOpportunity.id, {
        stage: OpportunityStage.PROPOSAL, // same as existing
      });

      const updateCall = prisma.opportunity.update.mock.calls[0][0];
      expect(updateCall.data.lastStageChangeAt).toBeUndefined();
    });

    it('should update only the provided fields', async () => {
      prisma.opportunity.findFirst.mockResolvedValue(mockOpportunity);
      prisma.opportunity.update.mockResolvedValue(mockOpportunityWithClient);

      await service.update(mockOpportunity.id, { title: 'Updated Title' });

      const updateCall = prisma.opportunity.update.mock.calls[0][0];
      expect(updateCall.data.title).toBe('Updated Title');
      // Other fields should not be in the data object
      expect(updateCall.data).not.toHaveProperty('amountCents');
      expect(updateCall.data).not.toHaveProperty('currency');
    });

    it('should throw NotFoundException when opportunity does not exist', async () => {
      prisma.opportunity.findFirst.mockResolvedValue(null);

      await expect(
        service.update('nonexistent-id', { title: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  /* ─── remove ──────────────────────────────────────────────────── */

  describe('remove', () => {
    it('should soft-delete by setting deletedAt', async () => {
      prisma.opportunity.findFirst.mockResolvedValue(mockOpportunity);
      prisma.opportunity.update.mockResolvedValue(mockOpportunity);

      await service.remove(mockOpportunity.id);

      const updateCall = prisma.opportunity.update.mock.calls[0][0];
      expect(updateCall.data.deletedAt).toBeInstanceOf(Date);
    });

    it('should throw NotFoundException for non-existent opportunity', async () => {
      prisma.opportunity.findFirst.mockResolvedValue(null);

      await expect(service.remove('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
