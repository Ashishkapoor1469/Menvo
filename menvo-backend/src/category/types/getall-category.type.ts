import { CategoryRepository } from '../infrastructure/category-repo.repository';

export type TgetAllCategory = {
  id: String;
  name: String;
  slug: String;
  sortOrder: Number;

  createdAt: Date;
  updatedAt: Date;

  restaurantId: String;
};

export type getAllCategoryPayload = {
  restaurantSlug: string;
};

export type getAllCategoryDeps = {
  repo: CategoryRepository;
};
