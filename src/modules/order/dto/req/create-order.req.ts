import { IsEmpty, IsOptional, Length } from 'class-validator';

export class CreateOrderReq {
  @IsOptional()
  @IsEmpty({ message: '' })
  @Length(1, 100)
  note?: string;
}
