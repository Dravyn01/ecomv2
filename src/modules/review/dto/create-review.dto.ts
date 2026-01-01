import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  Length,
  Max,
  Min,
  ValidateNested,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { CreateImageDTO } from 'src/modules/image/dto/create-image.dto';

export class CreateReviewDTO {
  @IsNotEmpty({ message: 'กรุณาเลือกสินค้าที่ต้องการรีวิว' })
  @IsUUID('4', { message: 'รหัสสินค้าต้องอยู่ในรูปแบบ UUID v4' })
  variant_id: string;

  @IsNotEmpty({ message: 'กรุณาเลือกจำนวนดาว' })
  @IsInt({ message: 'จำนวนดาวต้องเป็นตัวเลข' })
  @Min(1, { message: 'จำนวนดาวต้องไม่ต่ำกว่า 1 ดาว' })
  @Max(5, { message: 'จำนวนดาวต้องไม่เกิน 5 ดาว' })
  rating: number;

  @IsNotEmpty({ message: 'กรุณากรอกความคิดเห็นต่อสินค้า' })
  @Length(1, 100, {
    message: 'ความคิดเห็นต้องไม่สั้นเกินไป และ ยาวเกิน 100 ตัวอักษร',
  })
  comment: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateImageDTO)
  images?: CreateImageDTO[];
}
