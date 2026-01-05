import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdatePrimaryImageDTO {
  @IsBoolean()
  @IsNotEmpty()
  is_primary: boolean;
}
