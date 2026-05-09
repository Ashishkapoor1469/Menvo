import { Module } from '@nestjs/common';
import { RestrauntService } from './restaurant.service';
import { RestrauntController } from './restaurant.controller';

@Module({
  providers: [RestrauntService],
  controllers: [RestrauntController],
})
export class RestrauntModule {}
