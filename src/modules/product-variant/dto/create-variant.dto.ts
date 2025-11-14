import { IsInt, IsNumber, IsString, Length, Min } from 'class-validator';

// TODO add message

export class CreateVariantDTO {
  @IsInt()
  @Min(1, { message: 'หมายเลขสินค้าไม่ถูกต้อง' })
  product_id: number;

  @IsInt()
  @Min(1, { message: 'หมายเลขสีไม่ถูกต้อง' })
  color_id: number;

  @IsInt()
  @Min(1, { message: 'ราคาต้องไม่ต่ำกว่า 1 บาท' })
  size_id: number;

  @IsNumber({}, { message: 'ราคาต้องเป็นตัวเลข' })
  @Min(1, { message: 'หมายเลขไซส์ไม่ถูกต้อง' })
  price: number;

  @IsString({ message: '' })
  @Length(1, 100, { message: '' })
  sku: string;

  @IsString()
  image_url: string;

  @Min(1, { message: '' })
  @IsInt({ message: '' })
  quantity: number;
}
