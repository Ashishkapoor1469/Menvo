import {
  Controller,
  Body,
  UseGuards,
  Post,
  Get,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RestrauntService } from './restaurant.service';
import { RegisterRestaurantDto } from './dtos/restaurant.dto';
import { UpdateRestaurantDto } from './dtos/update-restaurant.dto';
import { GetUser } from '../decorator/get-user.decorator';
import { Restaurant } from '@prisma/client';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { IsPUblic } from '../decorator/isPublic.decorator';

@UseGuards(JwtGuard)
@Controller({ path: 'restraunt', version: '1' })
export class RestrauntController {
  constructor(private restraunt: RestrauntService) {}

  @Post('register')
  async register(
    @Body() body: RegisterRestaurantDto,
    @GetUser('userId') userId: string,
  ): Promise<Restaurant> {
    const { restaurantName, restaurantBio } = body;
    return this.restraunt.registerRestraunt({
      userId,
      restaurantName,
      restaurantBio,
    });
  }

  @Get('restaurants')
  async listRestaurants(@GetUser('userId') userId: string) {
    return this.restraunt.getRestaurantsByOwner(userId);
  }

  @IsPUblic()
  @Get('by-slug/:slug')
  async getBySlug(@Param('slug') slug: string) {
    return this.restraunt.getRestaurantBySlug(slug);
  }

  @Patch(':id')
  async updateRestaurant(
    @Param('id') id: string,
    @Body() dto: UpdateRestaurantDto,
    @GetUser('userId') userId: string,
  ) {
    return this.restraunt.updateRestaurant(id, userId, dto);
  }

  @Delete(':id')
  async deleteRestaurant(
    @Param('id') id: string,
    @GetUser('userId') userId: string,
  ) {
    return this.restraunt.deleteRestaurant(id, userId);
  }

  @Get('restaurant-greet')
  greet() {
    return 'hii this is restaurant protected route';
  }

  @IsPUblic()
  @Post(':slug/scan')
  async scanQr(@Param('slug') slug: string, @Body() body: { tableId: string }) {
    return this.restraunt.scanTableQr(slug, body.tableId);
  }
}
