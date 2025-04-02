import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

class VariantDto {
  @IsString()
  name: string;

  @IsString()
  value: string;
}
export class CreateProductDto {
  @Transform(({ value }) => value?.toString())
  @IsString()
  name: string;

  @Transform(({ value }) => value?.toString())
  @IsString()
  description: string;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  price: number;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  discountPrice?: number;

  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  stock: number;

  @IsString()
  sku: string;

  @IsString()
  brand: string;

  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  is_active: boolean;

  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    return value ? value.split(',').map((v: string) => v.trim()) : [];
  })
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];

  // หากใช้ variants ค่อยเพิ่มภายหลัง
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => VariantDto)
  variants?: VariantDto[];
}
