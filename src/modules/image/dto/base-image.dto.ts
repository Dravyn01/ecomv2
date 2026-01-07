import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
} from 'class-validator';
import { IMAGE_DTO_MESSAGE } from 'src/common/enums/dto/image.enum';

export class BaseImageDTO {
  @IsNotEmpty({ message: IMAGE_DTO_MESSAGE.URL_IS_NOT_EMPTY })
  @IsUrl(
    {
      require_host: true,
      protocols: ['https'],
      require_tld: true,
    },
    { message: IMAGE_DTO_MESSAGE.INVALID_URL },
  )
  url: string;

  @IsOptional()
  @IsString({ message: IMAGE_DTO_MESSAGE.PUBLIC_ID_MUST_BE_STRING })
  public_id?: string;

  @IsOptional()
  @IsString({ message: IMAGE_DTO_MESSAGE.ALT_MUST_BE_STRING })
  alt?: string;

  @IsNotEmpty({ message: IMAGE_DTO_MESSAGE.IS_PRIMARY_IS_NOT_EMPTY })
  @IsBoolean({ message: IMAGE_DTO_MESSAGE.IS_PRIMARY_MUST_BE_BOOLEAN })
  is_primary: boolean;

  @IsNotEmpty({ message: IMAGE_DTO_MESSAGE.WIDTH_IS_NOT_EMPTY })
  @IsInt({ message: IMAGE_DTO_MESSAGE.WIDTH_MUST_BE_INTEGER })
  @IsPositive({ message: IMAGE_DTO_MESSAGE.WIDTH_MUST_BE_POSITIVE })
  width: number;

  @IsNotEmpty({ message: IMAGE_DTO_MESSAGE.HEIGHT_IS_NOT_EMPTY })
  @IsInt({ message: IMAGE_DTO_MESSAGE.HEIGHT_MUST_BE_INTEGER })
  @IsPositive({ message: IMAGE_DTO_MESSAGE.HEIGHT_MUST_BE_POSITIVE })
  height: number;
}
