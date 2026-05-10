import { NotFoundException } from '@nestjs/common';
import type {
  TgetAllCategory,
  getAllCategoryDeps,
  getAllCategoryPayload,
} from '../types/getall-category.type';

export const getAllCategory = async (
  deps: getAllCategoryDeps,
  payload: getAllCategoryPayload,
): Promise<TgetAllCategory[]> => {
  const { repo } = deps;
  const { restaurantSlug } = payload;

  const restaurant = await repo.findRestaurantBySlug(restaurantSlug);

  if (!restaurant) throw new NotFoundException('restaurant not found');

  const allCategory: TgetAllCategory[] = await repo.getAllCategory(
    restaurant.id,
  );

  if (!allCategory.length) return [];

  return allCategory;
};
