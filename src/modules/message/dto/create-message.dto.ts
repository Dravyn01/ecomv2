import { IsUUID, IsNotEmpty, IsUrl, IsOptional } from 'class-validator';

export class CreateMessageDTO {
  @IsNotEmpty({ message: 'หมายเลขห้องสนทนาต้องไม่เป็นค่าว่าง' })
  @IsUUID()
  conversation_id: string;

  @IsNotEmpty({ message: 'ข้อความต้องไม่เป็นค่าว่าง' })
  text: string;

  @IsOptional()
  @IsUrl({ require_valid_protocol: true }, { message: 'url รูปภาพไม่ถูกต้อง' })
  image_urls?: string[];
}
