import { IsInt, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class DeleteMessageDTO {
  @IsOptional({ message: '' })
  @IsUUID('4', { message: '' })
  message_id: string;

  @IsOptional()
  @IsInt({ message: '' })
  reply_id?: string;

  @IsNotEmpty({ message: '' })
  @IsUUID()
  conversation_id: string;
}
