import { ClientType } from '@prisma/client';
export declare class CreateClientDto {
    type: ClientType;
    companyName?: string;
    firstName?: string;
    lastName?: string;
    email: string;
    phone?: string;
    address?: string;
    notes?: string;
}
