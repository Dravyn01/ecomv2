import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { CONFIG_ENUM } from 'src/common/enums/common/common.enum';
import { NOTIFICATION_DTO_MESSAGE } from 'src/common/enums/dto/notification.enum';

export enum DeleteNotificationType {
  DELETE_ONE = 'DELETE_ONE',
  DELETE_ALL = 'DELETE_ALL',
}

export class DeleteNotificationDTO {
  @IsNotEmpty({ message: NOTIFICATION_DTO_MESSAGE.ID_IS_NOT_EMPTY })
  @IsUUID(CONFIG_ENUM.UUID_VERSION, {
    message: NOTIFICATION_DTO_MESSAGE.ID_MUST_BE_UUID,
  })
  notification_id: string;

  @IsNotEmpty({ message: NOTIFICATION_DTO_MESSAGE.ACTION_IS_NOT_EMPTY })
  @IsEnum(DeleteNotificationType, {
    message: NOTIFICATION_DTO_MESSAGE.INVALID_ACTION,
  })
  action: DeleteNotificationType;
}
