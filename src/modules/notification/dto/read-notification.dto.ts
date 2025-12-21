import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';

export enum ActionNotification {
  READ_ONE = 'READ_ONE',
  READ_ALL = 'READ_ALL',
}

export class ReadNotification {
  @IsNotEmpty({ message: 'notification_id ต้องไม่เป็นค่าว่าง' })
  @IsUUID()
  notification_id: string;

  @IsNotEmpty({ message: 'ประเภพ action ต้องไม่เป็นค่าว่าง' })
  @IsEnum(ActionNotification, { message: 'ประเภพ action ไม่ถูกต้อง' })
  action: ActionNotification;
}
