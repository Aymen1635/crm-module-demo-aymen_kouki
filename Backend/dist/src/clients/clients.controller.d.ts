import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ClientFilterDto } from './dto/client-filter.dto';
export declare class ClientsController {
    private readonly clientsService;
    constructor(clientsService: ClientsService);
    findAll(query: ClientFilterDto): Promise<{
        id: string;
        type: import(".prisma/client").$Enums.ClientType;
        companyName: string | null;
        legalId: string | null;
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
        legalId: string | null;
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
        legalId: string | null;
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
        legalId: string | null;
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
        legalId: string | null;
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
