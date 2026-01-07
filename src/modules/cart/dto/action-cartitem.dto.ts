import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { ACTION_CART_ITEM_DTO_MESSAGE } from 'src/common/enums/dto/action-cartitem.enum';
import { COMMON_DTO } from 'src/common/enums/dto/common.enum';
import { VARIANT_DTO_MESSAGE } from 'src/common/enums/dto/variant.enum';

enum ACTION_TYPE {
  DECREASE,
  REMOVE,
}

export class ActionCartItemDTO {
  @IsNotEmpty({ message: '' })
  user_id: string;

  @IsNotEmpty({ message: VARIANT_DTO_MESSAGE.ID_IS_NOT_EMPTY })
  @IsUUID(COMMON_DTO.UUID_VERSION, {
    message: VARIANT_DTO_MESSAGE.ID_MUST_BE_UUID,
  })
  variant_id: string;

  @IsNotEmpty({ message: ACTION_CART_ITEM_DTO_MESSAGE.ACTION_IS_NOT_EMPTY })
  @IsEnum(ACTION_TYPE, {
    message: ACTION_CART_ITEM_DTO_MESSAGE.INVALID_ACTION,
  })
  action: ACTION_TYPE;
}
