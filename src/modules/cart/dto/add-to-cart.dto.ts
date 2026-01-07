import { IsNotEmpty, IsPositive, IsInt, IsUUID } from 'class-validator';
import { COMMON_DTO } from 'src/common/enums/dto/common.enum';
import { VARIANT_DTO_MESSAGE } from 'src/common/enums/dto/variant.enum';

export class AddToCartDTO {
  // # TESTING
  @IsPositive()
  user_id: string;

  @IsNotEmpty({ message: VARIANT_DTO_MESSAGE.ID_IS_NOT_EMPTY })
  @IsUUID(COMMON_DTO.UUID_VERSION, {
    message: VARIANT_DTO_MESSAGE.ID_MUST_BE_UUID,
  })
  variant_id: string;

  @IsNotEmpty({ message: COMMON_DTO.QTY_IS_NOT_EMPTY })
  @IsInt({ message: COMMON_DTO.QTY_IS_INTEGER })
  @IsPositive({ message: COMMON_DTO.QTY_IS_POSITIVE })
  quantity: number;
}
