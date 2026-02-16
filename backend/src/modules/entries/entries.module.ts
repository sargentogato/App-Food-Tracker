import { Module } from '@nestjs/common';
import { EntriesService } from './entries.service';
import { EntriesController } from './entries.controller';

@Module({
  controllers: [EntriesController],
  providers: [EntriesService],
})
export class EntriesModule {}
