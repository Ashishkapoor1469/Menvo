import { Module } from '@nestjs/common';
import { MenuController } from './presentation/menu.controller';
import { MenuRepository } from './infrastructure/menu.repo';

@Module({
  controllers: [MenuController],
  providers: [MenuRepository],
})
export class MenuModule {}
