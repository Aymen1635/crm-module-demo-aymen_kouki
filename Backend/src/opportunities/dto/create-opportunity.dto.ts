import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { OpportunityStage } from '@prisma/client';

export class CreateOpportunityDto {
  @IsUUID()
  clientId!: string;

  @IsString()
  @IsNotEmpty({ message: 'Title is required.' })
  @MaxLength(255)
  title!: string;

  @IsInt()
  @Min(1)
  amountCents!: number;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string = 'EUR';

  @IsDateString()
  expectedSignatureDate!: string;

  @IsOptional()
  @IsEnum(OpportunityStage)
  stage?: OpportunityStage = OpportunityStage.LEAD;
}
