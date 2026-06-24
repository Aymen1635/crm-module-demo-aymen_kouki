import { IsEnum, IsOptional } from 'class-validator';
import { ClientType } from '@prisma/client';

export class ClientFilterDto {
  @IsOptional()
  @IsEnum(ClientType)
  type?: ClientType;
}
