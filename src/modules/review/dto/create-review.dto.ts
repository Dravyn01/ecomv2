import {
  IsPositive,
  IsInt,
  IsNotEmpty,
  Length,
  Max,
  Min,
} from 'class-validator';
import { ImagesDTO } from 'src/modules/image/dto/create-image.dto';

export class CreateReviewDto extends ImagesDTO {
  @IsNotEmpty({ message: 'กรุณาเลือกสินค้าที่ต้องการรีวิว' })
  @IsInt({ message: '' })
  @IsPositive({ message: 'รหัสสินค้าต้องเป็นตัวเลขที่มากกว่า 0' })
  variant_id: number;

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
}
