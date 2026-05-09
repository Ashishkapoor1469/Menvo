import { Type } from 'class-transformer';
import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class MenuItemDto {
  @IsString()
  name!: string;

  @IsNumber()
  @Type(() => Number)
  price!: number;

  @IsString()
  categoryId!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  sortOrder?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  originalPrice?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  discountPercent?: number;

  @IsString()
  @IsOptional()
  weight?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  preparationTime?: number;

  @IsString()
  @IsOptional()
  dietaryPreference?: string;
}
