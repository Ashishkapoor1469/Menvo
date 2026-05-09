import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import slugify from 'slugify';
import {
  TCreateCategoryDeps,
  TCreateCategoryPayload,
} from '../types/createCategory.type';

export const createCategoryUseCase = async (
  deps: TCreateCategoryDeps,
  payload: TCreateCategoryPayload,
) => {
  // Repo and sortService is dependency's
  const { repo, sortService } = deps;
  const { dto, slug, userId } = payload;
  const { name, sortOrder, icon } = dto;

  try {
    // 1. Check restaurant
    const restaurant = await repo.findRestaurantBySlug(slug);
    if (!restaurant) throw new NotFoundException('restaurant not found!');

    // 2. Ownership check

    repo.checkRestaurantOwnership(restaurant.ownerId, userId);

    // 3. Sort order
    const sort_Order = await sortService.sortOrder(
      sortOrder,
      'category',
      'restaurantId',
      restaurant.id,
    );

    // 4. Slug generation
    const baseSlug = slugify(name, { lower: true, strict: true });
    let categorySlug = baseSlug;
    let count = 1;
    let MAX_ATTEMPTS = 10;

    while (MAX_ATTEMPTS--) {
      try {
        const category = await repo.createCategory({
          name,
          icon,
          slug: categorySlug,
          restaurantId: restaurant.id,
          sortOrder: sort_Order,
        });

        return {
          message: `${name} category created successfully!`,
          status: 200,
          data: category,
        };
      } catch (e: any) {
        if (e.code === 'P2002') {
          categorySlug = `${baseSlug}-${count++}`;
        } else {
          throw e;
        }
      }
    }

    throw new ConflictException('Failed to generate unique slug');
  } catch (e) {
    if (
      e instanceof ConflictException ||
      e instanceof NotFoundException ||
      e instanceof UnauthorizedException
    ) {
      throw e;
    }

    console.error('Error creating category:', e);
    throw new InternalServerErrorException(
      `Internal Server Error: ${e.message}`,
    );
  }
};
