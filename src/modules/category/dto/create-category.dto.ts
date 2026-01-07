import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  IsPositive,
} from 'class-validator';
import { CATEGORY_DTO_MESSAGE } from 'src/common/enums/dto/cateogry.enum';

export class CreateCategoryDTO {
  @IsNotEmpty({ message: CATEGORY_DTO_MESSAGE.NAME_IS_NOT_EMPTY })
  @IsString({ message: CATEGORY_DTO_MESSAGE.NAME_MUST_BE_STRING })
  @Length(1, 30, { message: CATEGORY_DTO_MESSAGE.INVALID_NAME_LENGTH })
  name: string;

  @IsOptional()
  @IsArray({ message: CATEGORY_DTO_MESSAGE.CATEGORY_IDS_MUST_BE_ARRAY }) // ดูว่าเป็ฯ array ไหม(ไม่ได้ดู elm)
  @IsInt({
    each: true,
    message: CATEGORY_DTO_MESSAGE.EACH_CATEOGRY_IDS_MUST_BE_INTEGER,
  }) // each: true ดู elm ทุกตัวว่าเป็น int ไหม
  @IsPositive({
    message: CATEGORY_DTO_MESSAGE.EACH_CATEOGRY_IDS_MUST_BE_POSITIVE,
  })
  category_ids?: number[];
}
