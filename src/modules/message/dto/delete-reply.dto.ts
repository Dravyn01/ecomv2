import { IsNotEmpty, IsUUID } from 'class-validator';

export class DeleteReplyDTO {
  @IsNotEmpty({ message: '' })
  @IsUUID('4', { message: '' })
  reply_id: string;

  @IsNotEmpty({ message: '' })
  @IsUUID()
  conversation_id: string;
}
