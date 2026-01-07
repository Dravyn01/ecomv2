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
import { VARIANT_DTO_MESSAGE } from 'src/common/enums/dto/variant.enum';
import { PRODUCT_DTO_MESSAGE } from 'src/common/enums/dto/product.enum';
import { IMAGE_DTO_MESSAGE } from 'src/common/enums/dto/image.enum';
import { CONFIG_ENUM } from 'src/common/enums/common/common.enum';

export class CreateVariantDTO {
  @IsNotEmpty({ message: PRODUCT_DTO_MESSAGE.ID_IS_NOT_EMPTY })
  @IsUUID(CONFIG_ENUM.UUID_VERSION, {
    message: PRODUCT_DTO_MESSAGE.ID_MUST_BE_UUID,
  })
  product_id: string;

  @IsNotEmpty({ message: VARIANT_DTO_MESSAGE.COLOR_ID_IS_NOT_EMPTY })
  @IsInt({ message: VARIANT_DTO_MESSAGE.COLOR_ID_MUST_BE_INTEGER })
  @IsPositive({ message: VARIANT_DTO_MESSAGE.COLOR_ID_MUST_BE_POSITIVE })
  color_id: number;

  @IsNotEmpty({ message: VARIANT_DTO_MESSAGE.SIZE_ID_IS_NOT_EMPTY })
  @IsInt({ message: VARIANT_DTO_MESSAGE.SIZE_ID_MUST_BE_INTEGER })
  @IsPositive({ message: VARIANT_DTO_MESSAGE.SIZE_ID_MUST_BE_POSITIVE })
  size_id: number;

  @IsNotEmpty({ message: VARIANT_DTO_MESSAGE.PRICE_IS_NOT_EMPTY })
  @IsNumber({}, { message: VARIANT_DTO_MESSAGE.PRICE_MUST_BE_NUMBER })
  @Min(1, { message: VARIANT_DTO_MESSAGE.PRICE_MIN })
  price: number;

  @IsOptional()
  @IsEnum(ProductVariantStatus, {
    message: VARIANT_DTO_MESSAGE.INVALID_VARIANT_STATUS,
  })
  status?: ProductVariantStatus;

  @IsNotEmpty({ message: IMAGE_DTO_MESSAGE.IMAGE_IS_NOT_EMPTY })
  @ValidateNested({ each: true })
  @Type(() => CreateImageDTO)
  images: CreateImageDTO[];
}
