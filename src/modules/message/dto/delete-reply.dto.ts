import { IsInt, IsNotEmpty, IsUUID } from 'class-validator';

export class DeleteReplyDTO {
  @IsNotEmpty({ message: '' })
  @IsInt({ message: '' })
  reply_id: number;

  @IsNotEmpty({ message: '' })
  @IsUUID()
  conversation_id: string;
}
