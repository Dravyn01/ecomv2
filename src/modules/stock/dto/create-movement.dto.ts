import {
  IsNotEmpty,
  IsPositive,
  IsEnum,
  IsOptional,
  Length,
  IsString,
  IsInt,
  IsUUID,
} from 'class-validator';
import { StockChangeType } from '../enums/stock-change.enum';
import { VARIANT_DTO_MESSAGE } from 'src/common/enums/dto/variant.enum';
import { STOCK_DTO_MESSAGE } from 'src/common/enums/dto/stock.enum';
import { ORDER_DTO } from 'src/common/enums/dto/order.enum';
import { CONFIG_ENUM } from 'src/common/enums/common/common.enum';
import { QUANTITY } from 'src/common/enums/dto/quantity.enum';

export class CreateMovementDTO {
  @IsNotEmpty({ message: VARIANT_DTO_MESSAGE.ID_IS_NOT_EMPTY })
  @IsUUID(CONFIG_ENUM.UUID_VERSION, {
    message: VARIANT_DTO_MESSAGE.ID_MUST_BE_UUID,
  })
  variant_id: string;

  @IsNotEmpty({ message: QUANTITY.QTY_IS_NOT_EMPTY })
  @IsInt({ message: QUANTITY.QTY_IS_INTEGER })
  @IsPositive({ message: QUANTITY.QTY_IS_POSITIVE })
  quantity: number;

  @IsNotEmpty({ message: STOCK_DTO_MESSAGE.CHANGE_TYPE_IS_NOT_EMPTY })
  @IsEnum(StockChangeType, {
    message: STOCK_DTO_MESSAGE.INVALID_CHANGE_TYPE,
  })
  change_type: StockChangeType;

  @IsOptional()
  @Length(1, 255, { message: STOCK_DTO_MESSAGE.INVALID_LENGTH_NOTE })
  @IsString({ message: STOCK_DTO_MESSAGE.NOTE_MUST_BE_STRING })
  note?: string;

  @IsOptional()
  @IsUUID(CONFIG_ENUM.UUID_VERSION, { message: ORDER_DTO.ID_MUST_BE_UUID })
  order_id?: string;
}
