import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

type TableConfig = {
  category: 'restaurantId';
  menuItem: 'categoryId';
};

@Injectable()
export class SortOrderService {
  constructor(private prisma: PrismaService) {}

  async sortOrder<T extends keyof TableConfig>(
    sort_order: string | number | undefined,
    table: T,
    field: TableConfig[T],
    value: string,
  ): Promise<number> {
    // normalize input
    const order = sort_order !== undefined ? Number(sort_order) : undefined;

    // if user provided sortOrder → use it
    if (order !== undefined && !isNaN(order)) {
      return order;
    }

    // auto-generate if undefined
    let last: { sortOrder: number } | null = null;

    if (table === 'category') {
      last = await this.prisma.category.findFirst({
        where: { [field]: value },
        orderBy: { sortOrder: 'desc' },
        select: { sortOrder: true },
      });
    }

    if (table === 'menuItem') {
      last = await this.prisma.menuItem.findFirst({
        where: { [field]: value },
        orderBy: { sortOrder: 'desc' },
        select: { sortOrder: true },
      });
    }

    // always return number
    return (last?.sortOrder ?? 0) + 10;
  }
}
