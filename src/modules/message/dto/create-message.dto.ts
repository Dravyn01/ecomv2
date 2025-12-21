import { IsUUID, IsNotEmpty, IsUrl, IsOptional } from 'class-validator';

export class CreateMessageDTO {
  @IsNotEmpty({ message: '' })
  @IsUUID()
  conversation_id: string;

  @IsNotEmpty({ message: '' })
  text: string;

  @IsOptional()
  @IsUrl({ require_valid_protocol: true }, { message: '' })
  image_urls?: string[];
}
