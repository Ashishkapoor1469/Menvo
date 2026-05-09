import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class RegisterRestaurantDto {
  @IsNotEmpty()
  @IsString()
  restaurantName: string | undefined;

  @IsOptional()
  @IsString()
  restaurantBio?: string;
}
