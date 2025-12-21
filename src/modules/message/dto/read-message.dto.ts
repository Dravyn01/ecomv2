import { IsArray, IsInt, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class ReadMessageDTO {
  @IsNotEmpty({ message: 'หมายเลขข้อความต้องไม่เป็นค่าว่าง' })
  @IsArray({ message: 'ประเภพข้อมูลไม่ถูกต้อง' })
  @IsInt({ each: true, message: 'ประเภพข้อมูลในแต่ละช่องไม่ถูกต้อง' })
  message_ids: number[];

  @IsNotEmpty({ message: 'หมายเลขห้องต้องไม่เป็นค่าว่าง' })
  @IsUUID()
  conversation_id: string;
}
