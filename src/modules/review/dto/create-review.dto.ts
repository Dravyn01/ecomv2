import { Type } from 'class-transformer';

import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  Length,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { CONFIG_ENUM } from 'src/common/enums/common/common.enum';
import { REVIEW_DTO_MESSAGE } from 'src/common/enums/dto/review.enum';
import { VARIANT_DTO_MESSAGE } from 'src/common/enums/dto/variant.enum';
import { CreateImageDTO } from 'src/modules/image/dto/create-image.dto';

export class CreateReviewDTO {
  @IsNotEmpty({ message: VARIANT_DTO_MESSAGE.ID_IS_NOT_EMPTY })
  @IsUUID(CONFIG_ENUM.UUID_VERSION, {
    message: VARIANT_DTO_MESSAGE.ID_MUST_BE_UUID,
  })
  variant_id: string;

  @IsNotEmpty({ message: REVIEW_DTO_MESSAGE.RATING_IS_NOT_EMPTY })
  @IsInt({ message: REVIEW_DTO_MESSAGE.RATING_MUST_BE_INTEGER })
  @Min(1, { message: REVIEW_DTO_MESSAGE.RATING_MIN })
  @Max(5, { message: REVIEW_DTO_MESSAGE.RATING_MAX })
  rating: number;

  @IsNotEmpty({ message: REVIEW_DTO_MESSAGE.COMMENT_IS_NOT_EMPTY })
  @Length(1, 100, {
    message: REVIEW_DTO_MESSAGE.COMMENT_INVALID_LENGTH,
  })
  comment: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateImageDTO)
  images?: CreateImageDTO[];
}
