import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class LoadMessages {
  @IsNotEmpty({ message: 'หมายเลขห้องต้องไม่เป็นค่าว่าง' })
  @IsUUID()
  conversation_id: string;

  @IsOptional()
  @IsUUID('4', { message: 'รูปแบบของหมายเลขข้อความไม่ถูกต้อง' })
  befor_message_id?: string;
}
