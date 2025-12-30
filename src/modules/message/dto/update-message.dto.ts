import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class UpdateMessageDTO {
  @IsNotEmpty({ message: '' })
  @IsUUID('4', { message: 'รูปแบบของหมายเลขข้อความไม่ถูกต้อง' })
  message_id: string;

  @IsNotEmpty({ message: '' })
  @IsUUID()
  conversation_id: string;

  @IsOptional()
  text?: string;
}
