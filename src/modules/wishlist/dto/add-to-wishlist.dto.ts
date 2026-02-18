import { IsNotEmpty, IsUUID } from 'class-validator';
import { APP_CONFIG } from 'src/common/enums/common/common.enum';
import { PRODUCT_DTO_MESSAGE } from 'src/common/enums/dto/product.enum';

export class AddToWishlistDto {
  @IsNotEmpty({ message: PRODUCT_DTO_MESSAGE.ID_IS_NOT_EMPTY })
  @IsUUID(APP_CONFIG.UUID_VERSION, {
    message: PRODUCT_DTO_MESSAGE.ID_MUST_BE_UUID,
  })
  product_id: string;
}
