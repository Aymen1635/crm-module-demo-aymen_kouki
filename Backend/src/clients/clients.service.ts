import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ClientType } from '@prisma/client';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(type?: ClientType) {
    return this.prisma.client.findMany({
      where: {
        deletedAt: null,
        ...(type ? { type } : {}),
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        companyName: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        createdAt: true,
      },
    });
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findFirst({
      where: { id, deletedAt: null },
    });

    if (!client) {
      throw new NotFoundException(`Client ${id} not found`);
    }

    return client;
  }

  async create(dto: CreateClientDto) {
    return this.prisma.client.create({
      data: {
        type: dto.type,
        companyName: dto.companyName,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
        notes: dto.notes,
      },
    });
  }

  async update(id: string, dto: UpdateClientDto) {
    await this.findOne(id); // ensures it exists and is not deleted

    return this.prisma.client.update({
      where: { id },
      data: {
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.companyName !== undefined && { companyName: dto.companyName }),
        ...(dto.firstName !== undefined && { firstName: dto.firstName }),
        ...(dto.lastName !== undefined && { lastName: dto.lastName }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // ensures it exists and is not deleted

    // Block delete if client has active (non-deleted) opportunities
    const activeOpportunities = await this.prisma.opportunity.count({
      where: { clientId: id, deletedAt: null },
    });

    if (activeOpportunities > 0) {
      throw new ConflictException(
        `Cannot delete client: ${activeOpportunities} active opportunity(-ies) exist. Delete them first.`,
      );
    }

    return this.prisma.client.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
