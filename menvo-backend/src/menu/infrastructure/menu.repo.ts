import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TCreateMenuItemPayload } from '../types/create-menuItem.type';
@Injectable()
export class MenuRepository {
  constructor(private prisma: PrismaService) {}

  /**
   * Create fresh Menu Item
   * @param data
   * @param slug
   */
  async createNewMenuItem(data: TCreateMenuItemPayload, slug: string) {
    const {
      categoryId,
      description,
      imageUrl,
      isAvailable,
      name,
      price,
      sortOrder,
      originalPrice,
      discountPercent,
      weight,
      preparationTime,
      dietaryPreference,
    } = data;

    return this.prisma.menuItem.create({
      data: {
        name,
        price,
        description,
        sortOrder: sortOrder,
        isAvailable: isAvailable ?? true,
        imageUrl,
        categoryId,
        slug: slug,
        originalPrice,
        discountPercent,
        weight,
        preparationTime,
        dietaryPreference,
      },
    });
  }

  async findAllByCategory(categoryId: string) {
    return this.prisma.menuItem.findMany({
      where: { categoryId: categoryId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async deleteMenuItem(id: string) {
    return this.prisma.menuItem.delete({ where: { id } });
  }

  async updateMenuItem(id: string, data: Partial<TCreateMenuItemPayload>) {
    return this.prisma.menuItem.update({
      where: { id },
      data,
    });
  }
}
