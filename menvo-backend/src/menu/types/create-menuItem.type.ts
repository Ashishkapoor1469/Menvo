import { SortOrderService } from '../../common/services/sort-order.service';
import { MenuRepository } from '../infrastructure/menu.repo';

export type TCreateMenuItemPayload = {
  name: string;
  price: number;
  categoryId: string;
  description?: string | undefined;
  isAvailable?: boolean;
  sortOrder: number | undefined;
  imageUrl?: string | undefined;
  originalPrice?: number | undefined;
  discountPercent?: number | undefined;
  weight?: string | undefined;
  preparationTime?: number | undefined;
  dietaryPreference?: string | undefined;
};

export type TCreateMenuItemDeps = {
  sortOrderService: SortOrderService;
  repo: MenuRepository;
};
