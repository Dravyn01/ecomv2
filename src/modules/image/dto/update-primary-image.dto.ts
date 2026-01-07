import { IsBoolean, IsNotEmpty } from 'class-validator';
import { IMAGE_DTO_MESSAGE } from 'src/common/enums/dto/image.enum';

export class UpdatePrimaryImageDTO {
  @IsBoolean({ message: IMAGE_DTO_MESSAGE.IS_PRIMARY_MUST_BE_BOOLEAN })
  @IsNotEmpty({ message: IMAGE_DTO_MESSAGE.IS_PRIMARY_IS_NOT_EMPTY })
  is_primary: boolean;
}
