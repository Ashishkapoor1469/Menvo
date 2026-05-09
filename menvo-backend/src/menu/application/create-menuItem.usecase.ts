import {
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import {
  TCreateMenuItemDeps,
  TCreateMenuItemPayload,
} from '../types/create-menuItem.type';
import slugify from 'slugify';

export async function createMenuItem(
  deps: TCreateMenuItemDeps,
  payload: TCreateMenuItemPayload,
) {
  const { repo, sortOrderService } = deps;
  const { name, price, categoryId, sortOrder } = payload;

  try {
    if (!name || price === undefined || price === null || !categoryId) {
      throw new BadRequestException('name, price and categoryId are required');
    }

    const baseSlug = slugify(name, { lower: true, strict: true });
    let MenuItemSlug = baseSlug;
    let count = 1;

    const sort_order = await sortOrderService.sortOrder(
      sortOrder,
      'menuItem',
      'categoryId',
      categoryId,
    );

    const data: TCreateMenuItemPayload = { ...payload, sortOrder: sort_order };

    let MAX_ATTEMPTS = 10;
    while (MAX_ATTEMPTS--) {
      try {
        const menuItem = await repo.createNewMenuItem(data, MenuItemSlug);
        return {
          message: `${name} menu item created successfully!`,
          status: 200,
          data: menuItem,
        };
      } catch (e: any) {
        if (e.code === 'P2002') {
          MenuItemSlug = `${baseSlug}-${count++}`;
        } else {
          throw new InternalServerErrorException('Internal Server Error');
        }
      }
    }

    throw new ConflictException(
      `Could not generate a unique slug for "${name}" after ${MAX_ATTEMPTS} attempts`,
    );
  } catch (e: any) {
    console.error('Error creating menu item:', e);
    if (e instanceof ConflictException || e instanceof BadRequestException)
      throw e;
    throw new InternalServerErrorException(
      e.message || 'Internal Server Error',
    );
  }
}
