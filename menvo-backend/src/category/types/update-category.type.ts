import { UpdateCategoryDto } from '../dtos/update-category.dto';
import { CategoryRepository } from '../infrastructure/category-repo.repository';

export type TUpdateCategoryPyload = {
  userId: string;
  categoryId: string;
  dto: UpdateCategoryDto;
};
export type TUpdateCategoryDeps = {
  repo: CategoryRepository;
};
