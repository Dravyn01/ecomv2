import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsInt,
  Min,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { ProductVariantStatus } from '../entities/product-variant.entity';
import { CreateImageDTO } from 'src/modules/image/dto/create-image.dto';
import { Type } from 'class-transformer';

export class CreateVariantDTO {
  @IsNotEmpty({ message: 'กรุณาเลือกสินค้า' })
  @IsUUID('4', { message: 'รหัสสินค้าต้องอยู่ในรูปแบบ UUID v4' })
  product_id: string;

  @IsNotEmpty({ message: 'กรุณาเลือกสี' })
  @IsInt({ message: '' })
  @IsPositive({ message: 'รหัสสีต้องเป็นตัวเลขที่มากกว่า 0' })
  color_id: number;

  @IsNotEmpty({ message: 'กรุณาเลือกไชส์' })
  @IsInt({ message: '' })
  @IsPositive({ message: 'รหัสไชส์ต้องเป็นตัวเลขที่มากกว่า 0' })
  size_id: number;

  @IsNotEmpty({ message: 'กรุณากรอกราคาสินค้า' })
  @IsNumber({}, { message: 'ราคาต้องเป็นตัวเลข' })
  @Min(1, { message: 'ราคาสินค้าต้องมากกว่า 1 บาท' })
  price: number;

  @IsOptional()
  @IsEnum(ProductVariantStatus, {
    message: 'สถานะสินค้าต้องเป็นหนึ่งใน ProductVariantStatus',
  })
  status?: ProductVariantStatus = ProductVariantStatus.INACTIVE;

  @ValidateNested({ each: true })
  @Type(() => CreateImageDTO)
  images: CreateImageDTO[];
}
