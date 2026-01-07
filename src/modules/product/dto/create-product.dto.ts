import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateImageDTO } from 'src/modules/image/dto/create-image.dto';
import { ProductStatus } from '../entities/product.entity';
import { PRODUCT_DTO_MESSAGE } from 'src/common/enums/dto/product.enum';
import { IMAGE_DTO_MESSAGE } from 'src/common/enums/dto/image.enum';
import { CATEGORY_DTO_MESSAGE } from 'src/common/enums/dto/cateogry.enum';

export class CreateProductDTO {
  @IsNotEmpty({ message: PRODUCT_DTO_MESSAGE.PRODUCT_NAME_IS_NOT_EMPTY })
  @IsString({ message: PRODUCT_DTO_MESSAGE.PRODUCT_NAME_MUST_BE_STRING })
  @Length(1, 100, {
    message: PRODUCT_DTO_MESSAGE.PRODUCT_NAME_INVALID_LENGTH,
  })
  name: string;

  @IsNotEmpty({ message: PRODUCT_DTO_MESSAGE.DESCRIPTION_IS_NOT_EMPTY })
  @IsString({ message: PRODUCT_DTO_MESSAGE.DESCRIPTION_MUST_BE_STRING })
  @Length(1, 255, {
    message: PRODUCT_DTO_MESSAGE.DESCRIPTION_INVALID_LENGTH,
  })
  description: string;

  @IsNotEmpty({ message: PRODUCT_DTO_MESSAGE.BASE_PRICE_IS_NOT_EMPTY })
  @IsNumber({}, { message: PRODUCT_DTO_MESSAGE.BASE_PRICE_MUST_BE_NUMBER })
  @Min(1, { message: PRODUCT_DTO_MESSAGE.BASE_PRICE_MIN })
  base_price: number;

  @IsOptional()
  @IsNumber({}, { message: PRODUCT_DTO_MESSAGE.DISCOUNT_PRICE_MUST_BE_NUMBER })
  @Min(1, { message: PRODUCT_DTO_MESSAGE.DISCOUNT_PRICE_MIN })
  discount_price?: number;

  @IsOptional()
  @IsEnum(ProductStatus, {
    message: PRODUCT_DTO_MESSAGE.INVALID_PRODUCT_STATUS,
  })
  status: ProductStatus;

  @IsOptional()
  @IsArray({ message: CATEGORY_DTO_MESSAGE.CATEGORY_IDS_MUST_BE_ARRAY })
  @IsInt({
    each: true,
    message: CATEGORY_DTO_MESSAGE.EACH_CATEOGRY_IDS_MUST_BE_INTEGER,
  })
  @IsPositive({
    each: true,
    message: CATEGORY_DTO_MESSAGE.CATEGORY_ID_MUST_BE_POSITIVE,
  })
  category_ids: number[];

  @IsNotEmpty({ message: IMAGE_DTO_MESSAGE.IMAGE_IS_NOT_EMPTY })
  @ValidateNested({ each: true })
  @Type(() => CreateImageDTO)
  images: CreateImageDTO[];
}
