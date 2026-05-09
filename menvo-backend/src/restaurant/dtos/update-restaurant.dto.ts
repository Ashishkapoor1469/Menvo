import { IsString, IsOptional } from 'class-validator';

export class UpdateRestaurantDto {
  @IsOptional()
  @IsString()
  restaurantName?: string;

  @IsOptional()
  @IsString()
  restaurantBio?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  address?: string;
}
