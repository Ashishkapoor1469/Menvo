import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateCategoryDto } from '../dtos/update-category.dto';

@Injectable()
export class CategoryRepository {
  constructor(private prisma: PrismaService) {}

  findRestaurantBySlug(slug: string) {
    return this.prisma.restaurant.findUnique({
      where: { slug },
    });
  }

  createCategory(data: {
    name: string;
    icon?: string;
    slug: string;
    restaurantId: string;
    sortOrder: number;
  }) {
    return this.prisma.category.create({ data });
  }

  checkRestaurantOwnership(restaurantOwnerId: string, userId: string) {
    if (restaurantOwnerId !== userId) {
      throw new UnauthorizedException('not your restaurant!');
    }
  }

  async findCategoryWithRestaurant(categoryId: string) {
    return this.prisma.category.findUnique({
      where: { id: categoryId },
      include: { restaurant: true },
    });
  }

  async updateCategory(categoryId: string, dto: UpdateCategoryDto) {
    return this.prisma.category.update({
      where: { id: categoryId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.icon !== undefined && { icon: dto.icon }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      },
    });
  }

  async getAllCategory(restaurantId: string) {
    return await this.prisma.category.findMany({
      where: { restaurantId },
      include: { items: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async deleteCategory(categoryId: string) {
    return this.prisma.category.delete({ where: { id: categoryId } });
  }
}
