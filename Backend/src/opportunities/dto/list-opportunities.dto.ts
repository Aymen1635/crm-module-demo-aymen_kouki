import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsIn,
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
  @IsIn(['createdAt', 'amountCents', 'expectedSignatureDate', 'stage'], {
    message: 'sortBy must be one of: createdAt, amountCents, expectedSignatureDate, stage',
  })
  sortBy?: SortField = 'createdAt';

  @IsOptional()
  @IsIn(['asc', 'desc'], { message: 'order must be asc or desc' })
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
  limit?: number = 10;
}
