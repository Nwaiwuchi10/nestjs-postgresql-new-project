// src/product/dto/create-product.dto.ts
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsEnum(['Image', 'Audio', 'Video', 'Other'])
  @IsOptional()
  fileType?: 'Image' | 'Audio' | 'Video' | 'Other';

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  fileUrl?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  productBenefits?: string[];
}
