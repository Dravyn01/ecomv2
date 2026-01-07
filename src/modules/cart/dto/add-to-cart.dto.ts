import { IsNotEmpty, IsPositive, IsInt, IsUUID } from 'class-validator';
import { CONFIG_ENUM } from 'src/common/enums/common/common.enum';
import { QUANTITY } from 'src/common/enums/dto/quantity.enum';
import { VARIANT_DTO_MESSAGE } from 'src/common/enums/dto/variant.enum';

export class AddToCartDTO {
  // # TESTING
  @IsPositive()
  user_id: string;

  @IsNotEmpty({ message: VARIANT_DTO_MESSAGE.ID_IS_NOT_EMPTY })
  @IsUUID(CONFIG_ENUM.UUID_VERSION, {
    message: VARIANT_DTO_MESSAGE.ID_MUST_BE_UUID,
  })
  variant_id: string;

  @IsNotEmpty({ message: QUANTITY.QTY_IS_NOT_EMPTY })
  @IsInt({ message: QUANTITY.QTY_IS_INTEGER })
  @IsPositive({ message: QUANTITY.QTY_IS_POSITIVE })
  quantity: number;
}
