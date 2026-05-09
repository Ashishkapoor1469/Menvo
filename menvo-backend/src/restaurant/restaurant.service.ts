import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { RegisterRestaurant } from './types/restaurant.type';
import { GenerateSlug } from '../common/services/generate-slug.service';
import { UpdateRestaurantDto } from './dtos/update-restaurant.dto';

@Injectable()
export class RestrauntService {
  constructor(
    private prisma: PrismaService,
    private generateSlug: GenerateSlug,
  ) {}

  async registerRestraunt({
    userId,
    restaurantName,
    restaurantBio,
  }: RegisterRestaurant) {
    try {
      if (!userId || !restaurantName)
        throw new BadRequestException('all fields must be filled');

      //create a slug from RestrauntName
      const slug: string =
        await this.generateSlug.RestaurantSlug(restaurantName);
      const newRestraunt = await this.prisma.restaurant.create({
        data: {
          ownerId: userId,
          name: restaurantName,
          slug,
          bio: restaurantBio ?? null,
        },
      });
      return newRestraunt;
    } catch (e: any) {
      if (e instanceof ConflictException || e instanceof BadRequestException)
        throw e;
      throw new InternalServerErrorException(
        `Internal Server Error - ${e.message}`,
      );
    }
  }

  async getRestaurantsByOwner(userId: string) {
    return this.prisma.restaurant.findMany({
      where: { ownerId: userId },
      include: {
        categories: {
          include: { items: { orderBy: { sortOrder: 'asc' } } },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getRestaurantBySlug(slug: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { slug },
      include: {
        categories: {
          include: { items: { orderBy: { sortOrder: 'asc' } } },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
    if (!restaurant)
      throw new NotFoundException(`Restaurant with slug "${slug}" not found`);
    return restaurant;
  }

  async updateRestaurant(id: string, userId: string, dto: UpdateRestaurantDto) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id },
    });
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    if (restaurant.ownerId !== userId)
      throw new ForbiddenException('Not your restaurant');

    return this.prisma.restaurant.update({
      where: { id },
      data: {
        ...(dto.restaurantName && { name: dto.restaurantName }),
        ...(dto.restaurantBio !== undefined && { bio: dto.restaurantBio }),
        ...(dto.logoUrl !== undefined && { logoUrl: dto.logoUrl }),
        ...(dto.currency !== undefined && { currency: dto.currency }),
        ...(dto.address !== undefined && { address: dto.address }),
      },
    });
  }

  async deleteRestaurant(id: string, userId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id },
    });
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    if (restaurant.ownerId !== userId)
      throw new ForbiddenException('Not your restaurant');

    await this.prisma.restaurant.delete({ where: { id } });
    return { message: 'Restaurant deleted successfully' };
  }

  async scanTableQr(slug: string, tableId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { slug },
    });
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    return this.prisma.tableScan.create({
      data: {
        tableId,
        restaurantId: restaurant.id,
      },
    });
  }
}
