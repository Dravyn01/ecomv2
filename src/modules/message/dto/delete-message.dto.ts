import { IsInt, IsNotEmpty, IsUUID } from 'class-validator';

export class DeleteMessageDTO {
  @IsNotEmpty({ message: '' })
  @IsInt({ message: '' })
  message_id: number;

  @IsNotEmpty({ message: '' })
  @IsUUID()
  conversation_id: string;
}
