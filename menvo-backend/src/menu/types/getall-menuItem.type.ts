import { MenuRepository } from '../infrastructure/menu.repo';

export type TGetAllMenuItemPayload = {
  category: string;
};

export type TGetAllMenuItemDeps = {
  repo: MenuRepository;
};
