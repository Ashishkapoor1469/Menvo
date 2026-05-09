import { Module } from '@nestjs/common';
import { CategoryController } from './presentation/category.controller';
import { CategoryRepository } from './infrastructure/category-repo.repository';
import { PrismaService } from '../prisma/prisma.service';
import { SortOrderService } from '../common/services/sort-order.service';

@Module({
  controllers: [CategoryController],
  providers: [CategoryRepository, PrismaService, SortOrderService],
})
export class CategoryModule {}
