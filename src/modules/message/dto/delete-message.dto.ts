import { IsInt, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class DeleteMessageDTO {
  @IsOptional({ message: '' })
  @IsInt({ message: '' })
  message_id?: number;

  @IsOptional()
  @IsInt({ message: '' })
  reply_id?: number;

  @IsNotEmpty({ message: '' })
  @IsUUID()
  conversation_id: string;
}
