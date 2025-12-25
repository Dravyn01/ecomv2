import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { Message, Role, StockStatus } from 'src/config/entities.config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtPayload } from 'src/common/strategies/jwt.strategy';

/*
 * WARNING: อาจมีเคสที่กด delete all notification แล้วไม่มี notification ให้ลบแล้วโดน throw error มาให้
 * */
@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notifyRepo: Repository<Notification>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findOneBySender(
    notificatino_id: string,
    sender_id: number,
  ): Promise<Notification> {
    const notification = await this.notifyRepo.findOneBy({
      id: notificatino_id,
      sender: { id: sender_id },
    });

    if (!notification) throw new NotFoundException('ไม่พบการแจ้งเดือนนี้');

    return notification;
  }

  async createNotification(user: JwtPayload, message: Message) {
    const savedNotify = this.notifyRepo.create({
      title:
        user.role === Role.SUPPORT
          ? 'แอดมินตอบกลับแล้ว'
          : 'ข้อความใหม่จากผู้ใช้',
      message: message.text,
      sender: { id: user.sub },
      conversation: { id: message.conversation.id },
      receiver:
        user.role !== Role.SUPPORT
          ? { id: message.conversation.user.id }
          : { id: user.sub },
    });

    console.log('[createNotification]', savedNotify);

    await this.notifyRepo.save(savedNotify);
  }

  async createStockAlert(variant_id: number, status: StockStatus) {
    const newNotification = await this.notifyRepo.save({
      title: status === StockStatus.OUT ? 'สต็อกหมดแล้ว' : 'สต็อกใกล์หมดแล้ว',
      type: NotificationType.STOCK_ALERT,
      message: `สินค้า "${variant_id}" ${status === StockStatus.OUT ? 'หมดสต็อกแล้ว' : 'ใกล์สต็อกแล้ว'}`,
    });

    console.log('[StockAlert]:', newNotification);

    this.eventEmitter.emit('NEW_NOTIFICATION', newNotification);
    console.log('EventEmitter is sending complete!');
  }

  async deleteOneNotification(senderId: number, notification_id: string) {
    const deleteResult = await this.notifyRepo.delete({
      id: notification_id,
      sender: { id: senderId },
    });

    if (deleteResult.affected === 0) {
      throw new ForbiddenException();
    }
    // TODO: return affected count to gateway
  }

  async deleteAllReadNotifications(senderId: number) {
    const deleteResult = await this.notifyRepo.delete({
      sender: { id: senderId },
      read_at: Not(IsNull()),
    });

    if (deleteResult.affected === 0) {
      throw new ForbiddenException();
    }

    return deleteResult.affected;
  }

  async markOneNotificationAsRead(senderId: number, notificationId: string) {
    const updateResult = await this.notifyRepo.update(
      {
        id: notificationId,
        sender: { id: senderId },
        read_at: IsNull(),
      },
      {
        read_at: new Date(),
      },
    );

    if (updateResult.affected === 0) {
      throw new ForbiddenException();
    }
  }

  async markAllNotificationsAsRead(sender_id: number) {
    const updatedResult = await this.notifyRepo.update(
      {
        receiver: { id: sender_id },
        read_at: undefined,
      },
      {
        read_at: new Date(),
      },
    );

    if (updatedResult.affected === 0) throw new ForbiddenException();

    return await this.notifyRepo.countBy({
      receiver: { id: sender_id },
      read_at: undefined,
    });
  }
}
