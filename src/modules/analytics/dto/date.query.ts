import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class DateQueryDTO {
  @IsNotEmpty()
  @IsString()
  from: string;

  @IsOptional()
  @IsString()
  to?: string;
}
