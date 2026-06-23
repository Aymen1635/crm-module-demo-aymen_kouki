import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ClientsModule } from './clients/clients.module';
import { OpportunitiesModule } from './opportunities/opportunities.module';
import { PipelineModule } from './pipeline/pipeline.module';

@Module({
  imports: [
    PrismaModule,
    ClientsModule,
    OpportunitiesModule,
    PipelineModule,
  ],
})
export class AppModule {}
