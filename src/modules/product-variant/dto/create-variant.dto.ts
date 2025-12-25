import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsInt,
  Min,
} from 'class-validator';
import { ProductVariantStatus } from '../entities/product-variant.entity';
import { ImagesDTO } from 'src/modules/image/dto/images.dto';

export class CreateVariantDTO extends ImagesDTO {
  @IsNotEmpty({ message: 'กรุณาเลือกสินค้า' })
  @IsInt({ message: '' })
  @IsPositive({ message: 'รหัสสินค้าต้องเป็นตัวเลขที่มากกว่า 0' })
  product_id: number;

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
}
