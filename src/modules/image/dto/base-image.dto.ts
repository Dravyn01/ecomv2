import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Min,
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

  @IsNotEmpty({ message: '' })
  @IsInt({ message: '' })
  @Min(1, { message: '' })
  order: number;
}
