import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Length,
  Min,
} from 'class-validator';
import { StockChangeType } from '../enums/stock-change.enum';

export class CreateMovement {
  @IsNotEmpty({ message: '' })
  @Min(1, { message: '' })
  @IsInt({ message: '' })
  variant_id: number;

  @IsNotEmpty({ message: '' })
  @IsInt({ message: '' })
  quantity: number;

  @IsNotEmpty({ message: '' })
  @Min(1, { message: '' })
  @IsIn([StockChangeType])
  change_type: StockChangeType;

  @IsOptional()
  @IsNotEmpty({ message: '' })
  @Length(1, 255, { message: '' })
  note?: string;

  @IsOptional()
  @IsInt({ message: '' })
  @Min(1, { message: '' })
  order_id?: number;
}
