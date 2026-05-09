import {
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  TUpdateCategoryPyload,
  TUpdateCategoryDeps,
} from '../types/update-category.type';

export const UpdateCategory = async (
  deps: TUpdateCategoryDeps,
  payload: TUpdateCategoryPyload,
) => {
  const { repo } = deps;
  const { userId, categoryId, dto } = payload;
  const { name, sortOrder } = dto;

  const category = await repo.findCategoryWithRestaurant(categoryId);
  if (!category) throw new NotFoundException('category not found');
  if (category.restaurant.ownerId !== userId)
    throw new ForbiddenException('Not your restaurant');
  return repo.updateCategory(categoryId, dto);
};
