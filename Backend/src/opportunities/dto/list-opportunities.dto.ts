import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { ClientType, OpportunityStage } from '@prisma/client';

export type SortField =
  | 'createdAt'
  | 'amountCents'
  | 'expectedSignatureDate'
  | 'stage';

export type SortOrder = 'asc' | 'desc';

export class ListOpportunitiesDto {
  @IsOptional()
  @IsEnum(OpportunityStage)
  stage?: OpportunityStage;

  @IsOptional()
  @IsEnum(ClientType)
  clientType?: ClientType;

  @IsOptional()
  sortBy?: SortField = 'createdAt';

  @IsOptional()
  order?: SortOrder = 'desc';

  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }: { value: unknown }) => parseInt(String(value), 10))
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }: { value: unknown }) => parseInt(String(value), 10))
  limit?: number = 20;
}
