import { CategoryRepository } from '../infrastructure/category-repo.repository';

export type TgetAllCategory = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;

  createdAt: Date;
  updatedAt: Date;

  restaurantId: string;
};

export type getAllCategoryPayload = {
  restaurantSlug: string;
};

export type getAllCategoryDeps = {
  repo: CategoryRepository;
};
