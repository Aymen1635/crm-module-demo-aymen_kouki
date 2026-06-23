import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { ClientType } from '@prisma/client';

export class CreateClientDto {
  @IsEnum(ClientType)
  type!: ClientType;

  // ─── Company fields ───────────────────────────────────────────
  @ValidateIf((o: CreateClientDto) => o.type === ClientType.COMPANY)
  @IsString()
  @MaxLength(255)
  companyName?: string;

  // ─── Individual fields ────────────────────────────────────────
  @ValidateIf((o: CreateClientDto) => o.type === ClientType.INDIVIDUAL)
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @ValidateIf((o: CreateClientDto) => o.type === ClientType.INDIVIDUAL)
  @IsString()
  @MaxLength(100)
  lastName?: string;

  // ─── Shared fields ────────────────────────────────────────────
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
