import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { MenuRepository } from '../infrastructure/menu.repo';
import { GetUser } from '../../decorator/get-user.decorator';
import { MenuItemDto } from './../dtos/menuItem.dto';
import { createMenuItem } from '../application/create-menuItem.usecase';
import { SortOrderService } from '../../common/services/sort-order.service';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { IsPUblic } from '../../decorator/isPublic.decorator';

@UseGuards(JwtGuard)
@Controller({ path: 'menu', version: '1' })
export class MenuController {
  constructor(
    private MenuRepo: MenuRepository,
    private sortService: SortOrderService,
  ) {}

  @Post('create')
  createItem(@Body() dto: MenuItemDto, @GetUser('userId') userid: string) {
    return createMenuItem(
      { repo: this.MenuRepo, sortOrderService: this.sortService },
      {
        name: dto.name,
        categoryId: dto.categoryId,
        description: dto.description,
        imageUrl: dto.imageUrl,
        isAvailable: dto.isAvailable,
        price: dto.price,
        sortOrder: dto.sortOrder,
        originalPrice: dto.originalPrice,
        discountPercent: dto.discountPercent,
        weight: dto.weight,
        preparationTime: dto.preparationTime,
        dietaryPreference: dto.dietaryPreference,
      },
    );
  }

  @IsPUblic()
  @Get(':categoryId/items')
  async getItemsByCategory(@Param('categoryId') categoryId: string) {
    return this.MenuRepo.findAllByCategory(categoryId);
  }

  @Delete('delete/:id')
  async deleteItem(@Param('id') id: string, @GetUser('userId') userId: string) {
    return this.MenuRepo.deleteMenuItem(id);
  }

  @Patch('update/:id')
  async updateItem(@Param('id') id: string, @Body() dto: Partial<MenuItemDto>) {
    return this.MenuRepo.updateMenuItem(id, {
      name: dto.name,
      categoryId: dto.categoryId,
      description: dto.description,
      imageUrl: dto.imageUrl,
      isAvailable: dto.isAvailable,
      price: dto.price,
      sortOrder: dto.sortOrder,
      originalPrice: dto.originalPrice,
      discountPercent: dto.discountPercent,
      weight: dto.weight,
      preparationTime: dto.preparationTime,
      dietaryPreference: dto.dietaryPreference,
    });
  }
}
