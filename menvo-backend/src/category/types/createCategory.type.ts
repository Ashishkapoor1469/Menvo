import { SortOrderService } from '../../common/services/sort-order.service';
import { CategoryRepository } from '../infrastructure/category-repo.repository';
import { CreateCategory } from '../dtos/create-category.dto';

export type TCreateCategoryDeps = {
  repo: CategoryRepository;
  sortService: SortOrderService;
};

export type TCreateCategoryPayload = {
  slug: string;
  userId: string;
  dto: CreateCategory;
};
