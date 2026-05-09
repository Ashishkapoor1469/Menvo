import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
@Injectable()
export class GenerateSlug {
  constructor(private prisma: PrismaService) {}

  async RestaurantSlug(name: string) {
    let baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');

    let slug = baseSlug;
    let count = 1;

    while (await this.prisma.restaurant.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${count++}`;
    }
    return slug;
  }
}
