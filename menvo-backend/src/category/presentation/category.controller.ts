import {
  Controller,
  Post,
  UseGuards,
  Body,
  Param,
  Get,
  Patch,
  Delete,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { createCategoryUseCase } from '../application/create-category.usecase';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { CreateCategory } from '../dtos/create-category.dto';
import { GetUser } from '../../decorator/get-user.decorator';
import { IsPUblic } from '../../decorator/isPublic.decorator';
import { CategoryRepository } from '../infrastructure/category-repo.repository';
import { SortOrderService } from '../../common/services/sort-order.service';
import { UpdateCategory } from '../application/update-category.usecase';
import { UpdateCategoryDto } from '../dtos/update-category.dto';
import { getAllCategory } from '../application/getall-categoryusecase';

@UseGuards(JwtGuard)
@Controller({ path: ':slug/category', version: '1' })
export class CategoryController {
  constructor(
    private repo: CategoryRepository,
    private sortService: SortOrderService,
  ) {}
  @IsPUblic()
  @Get('greet')
  greet() {
    return 'hiiii';
  }

  // Create Category
  @Post('create')
  async create(
    @Body() dto: CreateCategory,
    @Param('slug') slug: string,
    @GetUser('userId') userId: string,
  ) {
    return createCategoryUseCase(
      { repo: this.repo, sortService: this.sortService },
      { slug, userId, dto },
    );
  }

  // Update Category
  @Patch('update/:id')
  async getCategory(
    @Body() dto: UpdateCategoryDto,
    @Param('id') id: string,
    @GetUser('userId') userId: string,
  ) {
    return UpdateCategory(
      { repo: this.repo },
      { userId: userId, categoryId: id, dto: dto },
    );
  }

  @IsPUblic()
  @Get('categories')
  async GetAllCategory(@Param('slug') slug: string) {
    return await getAllCategory({ repo: this.repo }, { restaurantSlug: slug });
  }

  // Delete Category
  @Delete('delete/:id')
  async deleteCategory(
    @Param('id') id: string,
    @GetUser('userId') userId: string,
  ) {
    const category = await this.repo.findCategoryWithRestaurant(id);
    if (!category) throw new NotFoundException('category not found');
    if (category.restaurant.ownerId !== userId)
      throw new ForbiddenException('Not your restaurant');
    return this.repo.deleteCategory(id);
  }
}
