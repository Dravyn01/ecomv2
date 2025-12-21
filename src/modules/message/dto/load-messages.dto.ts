import { IsInt, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class LoadMessages {
  @IsNotEmpty({ message: 'หมายเลขห้องต้องไม่เป็นค่าว่าง' })
  @IsUUID()
  conversation_id: string;

  @IsOptional()
  @IsInt()
  befor_message_id?: number;
}
