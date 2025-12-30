import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
} from 'class-validator';

export class BaseImageDTO {
  @IsNotEmpty({ message: '' })
  @IsUrl(
    { require_host: true, protocols: ['https'], require_tld: true },
    { message: '' },
  )
  url: string;

  @IsOptional()
  @IsString()
  public_id?: string;

  @IsOptional()
  @IsString()
  alt?: string;

  @IsNotEmpty()
  @IsBoolean()
  is_primary: boolean;

  @IsNotEmpty({ message: '' })
  @IsInt()
  @IsPositive()
  width: number;

  @IsNotEmpty({ message: '' })
  @IsInt()
  @IsPositive()
  height: number;
}
