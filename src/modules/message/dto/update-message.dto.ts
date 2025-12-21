import { IsInt, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class UpdateMessageDTO {
  @IsNotEmpty({ message: '' })
  @IsInt()
  message_id: number;

  @IsNotEmpty({ message: '' })
  @IsUUID()
  conversation_id: string;

  @IsOptional()
  text?: string;
}
