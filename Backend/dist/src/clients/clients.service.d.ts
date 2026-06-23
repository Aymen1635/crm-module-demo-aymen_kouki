import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ClientType } from '@prisma/client';
export declare class ClientsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(type?: ClientType): Promise<{
        id: string;
        type: import(".prisma/client").$Enums.ClientType;
        companyName: string | null;
        firstName: string | null;
        lastName: string | null;
        email: string;
        phone: string | null;
        createdAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        type: import(".prisma/client").$Enums.ClientType;
        companyName: string | null;
        firstName: string | null;
        lastName: string | null;
        email: string;
        phone: string | null;
        address: string | null;
        notes: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(dto: CreateClientDto): Promise<{
        id: string;
        type: import(".prisma/client").$Enums.ClientType;
        companyName: string | null;
        firstName: string | null;
        lastName: string | null;
        email: string;
        phone: string | null;
        address: string | null;
        notes: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdateClientDto): Promise<{
        id: string;
        type: import(".prisma/client").$Enums.ClientType;
        companyName: string | null;
        firstName: string | null;
        lastName: string | null;
        email: string;
        phone: string | null;
        address: string | null;
        notes: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        type: import(".prisma/client").$Enums.ClientType;
        companyName: string | null;
        firstName: string | null;
        lastName: string | null;
        email: string;
        phone: string | null;
        address: string | null;
        notes: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
