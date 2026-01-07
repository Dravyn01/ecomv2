import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { CONFIG_ENUM } from 'src/common/enums/common/common.enum';
import { NOTIFICATION_DTO_MESSAGE } from 'src/common/enums/dto/notification.enum';

export enum ActionNotification {
  READ_ONE = 'READ_ONE',
  READ_ALL = 'READ_ALL',
}

export class ReadNotification {
  @IsNotEmpty({ message: NOTIFICATION_DTO_MESSAGE.ID_IS_NOT_EMPTY })
  @IsUUID(CONFIG_ENUM.UUID_VERSION, {
    message: NOTIFICATION_DTO_MESSAGE.ID_MUST_BE_UUID,
  })
  notification_id: string;

  @IsNotEmpty({ message: NOTIFICATION_DTO_MESSAGE.ACTION_IS_NOT_EMPTY })
  @IsEnum(ActionNotification, {
    message: NOTIFICATION_DTO_MESSAGE.INVALID_ACTION,
  })
  action: ActionNotification;
}
