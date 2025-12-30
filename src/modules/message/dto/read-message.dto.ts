import { IsArray, IsNotEmpty, IsUUID } from 'class-validator';

export class ReadMessageDTO {
  @IsNotEmpty({ message: 'หมายเลขข้อความต้องไม่เป็นค่าว่าง' })
  @IsArray({ message: 'ประเภพข้อมูลไม่ถูกต้อง' })
  @IsUUID('4', { each: true, message: 'รูปแบบของหมายเลขข้อความไม่ถูกต้อง' })
  message_ids: string[];

  @IsNotEmpty({ message: 'หมายเลขห้องต้องไม่เป็นค่าว่าง' })
  @IsUUID()
  conversation_id: string;
}
