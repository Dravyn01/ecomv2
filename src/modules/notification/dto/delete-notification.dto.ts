import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';

export enum DeleteNotificationType {
  DELETE_ONE = 'DELETE_ONE',
  DELETE_ALL = 'DELETE_ALL',
}

export class DeleteNotificationDTO {
  @IsNotEmpty({ message: '' })
  @IsUUID()
  notification_id: string;

  @IsNotEmpty({ message: '' })
  @IsEnum(DeleteNotificationType, { message: '' })
  action: DeleteNotificationType;
}
