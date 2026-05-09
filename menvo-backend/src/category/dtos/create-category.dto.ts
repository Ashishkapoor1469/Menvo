import { Type } from 'class-transformer';
import { IsString, IsOptional, IsInt } from 'class-validator';

export class CreateCategory {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;
}
