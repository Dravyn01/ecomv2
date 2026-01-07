import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { NotFoundException, UseGuards } from '@nestjs/common';
import { Role } from 'src/modules/user/entities/user.entity';
import { Inbox } from './entities/inbox.entity';
import { Roles } from 'src/common/decorators/role.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatService } from './chat.service';
import { CheckRoleGuard } from 'src/common/guards/role.guard';
import { NotificationService } from '../notification/notification.service';
import { JwtPayload } from 'src/common/strategies/jwt.strategy';
import { MessageService } from '../message/message.service';
import { CreateMessageDTO } from '../message/dto/create-message.dto';
import { UpdateMessageDTO } from '../message/dto/update-message.dto';
import { DeleteMessageDTO } from '../message/dto/delete-message.dto';
import { ReadMessageDTO } from '../message/dto/read-message.dto';
import { CreateReplyDTO } from '../message/dto/create-reply.dto';
import { ConversationService } from '../conversation/conversation.service';
import { WsJwtGuard } from 'src/common/guards/ws/ws-jwt.guard';
import { WsCheckRole } from 'src/common/guards/ws/ws-role.guard';
import { LoadMessagesDTO } from '../message/dto/load-messages.dto';

/*
 * NOTE:
 * ทุก event ยังไม่ได้มีการเทสเกิดขี้น เนื่องจากเขียน api ตัวนี้บนมือถือ และ ไม่มี tools ให้เทส
 *
 * WARNING: ข้อมูลที่ emit กลับไปหา client อาจไม่ครบตามที่ client ต้องการ
 * */
@WebSocketGateway({
  cors: { origin: '*' },
})
@UseGuards(WsJwtGuard)
export class ChatGateway {
  @WebSocketServer()
  readonly server: Server;

  // private readonly logger = new Logger(ChatGateway.name);
  // private readonly className = 'chat.gateway';

  constructor(
    @InjectRepository(Inbox) private readonly inboxRepo: Repository<Inbox>,
    private readonly chatService: ChatService,
    private readonly notifyService: NotificationService,
    private readonly messageService: MessageService,
    private readonly conversationService: ConversationService,
  ) {}

  /**
   * เมื่อผู้ใช้กด "คุยกับแอดมิน"
   * จะสร้าง conversation ใหม่(if not exists)
   */
  @Roles(Role.USER)
  @UseGuards(WsJwtGuard, CheckRoleGuard)
  @SubscribeMessage('JOIN_ROOM')
  async onJoinRoom(@ConnectedSocket() client: Socket) {
    const conversation_id = await this.conversationService.joinRoom(
      client.data.user.sub,
    );

    client.join(`ROOM_${conversation_id}`);

    this.server
      .to(`ROOM_${conversation_id}`)
      .emit('JOINED_ROOM', { conversation_id });
  }

  /**
   * รับข้อความจาก user แล้วบันทึก และกระจายให้ผู้ฟังในห้องสนทนา
   */
  @Roles(Role.USER, Role.SUPPORT)
  @UseGuards(WsJwtGuard, WsCheckRole)
  @SubscribeMessage('SEND_MESSAGE')
  async onSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    dto: CreateMessageDTO,
  ) {
    const user: JwtPayload = client.data.user;

    // save message
    const message = await this.messageService.createMessage(user, dto);

    // สร้างการแจ้งเดือนสำหรับแจ้งเดือนครั้งนี้
    const newNotification = await this.notifyService.createNotification(
      user,
      message,
    );

    // create inbox
    await this.chatService.createInbox(user.sub, dto.conversation_id);

    // Notification: ส่งแจ้งเตือนหาผู้ใช้
    if (user.role === Role.SUPPORT) {
      this.server.to(`SUPPORT_ROOM`).emit('NEW_NOTIFICATION', newNotification);
    } else {
      this.server
        .to(`USER_${message.sender.id}`)
        .emit('NEW_NOTIFICATION', newNotification);
    }

    // Message: ส่งข้อความไปยังห้องสนทนาของผู้ใช้และ support ที่เกี่ยวข้อง
    this.server.to(`ROOM_${dto.conversation_id}`).emit('NEW_MESSAGE', message);

    // Inbox: แจ้ง support room ว่ามี inbox ใหม่
    // WARNING: message.sender อาจมีแค่ field id เนื่องจากทำการ  save ด้วย id
    this.server.to('SUPPORT_ROOM').emit('NEW_INBOX', {
      conversation_id: dto.conversation_id,
      user: message.sender,
    });
  }

  @SubscribeMessage('UPDATE_MESSAGE')
  async onUpdateMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: UpdateMessageDTO,
  ) {
    await this.messageService.updateMessage(client.data.user.sub, dto);

    this.server.to(`ROOM_${dto.conversation_id}`).emit('MESSAGE_UPDATED', {
      message_id: dto.message_id,
      text: dto.text,
      edit_at: new Date(),
    });
  }

  @SubscribeMessage('REPLY_MESSAGE')
  async onReplyMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: CreateReplyDTO,
  ) {
    const newReply = await this.messageService.createReplyMessage(
      client.data.user.sub,
      dto,
    );

    this.server.to(`ROOM_${dto.conversation_id}`).emit('NEW_REPLY', {
      newReply,
    });
  }

  @SubscribeMessage('DELETE_MESSAGE')
  async onDeleteMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: DeleteMessageDTO,
  ) {
    await this.messageService.deleteMessage(client.data.user.sub, dto);

    this.server.to(`ROOM_${dto.conversation_id}`).emit('DELETE_MESSAGE', {
      message_id: dto.message_id,
    });
  }

  /**
   * ให้พนักงาน support join ห้องของลูกค้า หลังผ่านการตรวจสอบสิทธิ์แล้ว
   */
  @Roles(Role.SUPPORT)
  @UseGuards(WsCheckRole)
  @SubscribeMessage('SUPPORT_JOIN_USER_ROOM')
  async onSupportJoinUserRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() conversation_id: string,
  ) {
    if (!(await this.conversationService.existsConversation(conversation_id))) {
      throw new NotFoundException('ไม่พบห้องสนทนานี้');
    }

    const existsInbox = await this.inboxRepo.findOneBy({
      conversation: { id: conversation_id },
    });

    // mark ว่าเปิด inbox แล้ว
    if (existsInbox && !existsInbox.open_at) {
      existsInbox.open_at = new Date();
      await this.inboxRepo.save(existsInbox);
    }
    client.join(`ROOM_${conversation_id}`);
  }

  /**
   * อ่านกลุ่มข้อความและ broadcast ให้ผู้ฟังในห้องรู้ว่ามีข้อความถูกอ่านแล้ว
   */
  @Roles(Role.SUPPORT, Role.USER)
  @UseGuards(CheckRoleGuard)
  @SubscribeMessage('READ_MESSAGES')
  async onReadMessage(
    @MessageBody() dto: ReadMessageDTO,
    @ConnectedSocket() client: Socket,
  ) {
    await this.messageService.readMessage(client.data.user.sub, dto);

    this.server.to(`ROOM_${dto.conversation_id}`).emit('MESSAGES_READ', {
      message_ids: dto.message_ids,
      conversation_id: dto.conversation_id,
    });
  }

  @SubscribeMessage('READ_ONE_NOTIFICATION')
  async onReadOneNotification(
    @ConnectedSocket() client: Socket,
    @MessageBody() notification_id: string,
  ) {
    await this.notifyService.markOneNotificationAsRead(
      client.data.user.sub,
      notification_id,
    );

    this.server.to(`USER_${client.data.user.sub}`).emit('NOTIFICATION_READ', {
      notification_id,
    });
  }

  @SubscribeMessage('READ_ALL_NOTIFICATION')
  async onReadAllNotify(@ConnectedSocket() client: Socket) {
    const unread_count = await this.notifyService.markAllNotificationsAsRead(
      client.data.user.sub,
    );
    this.server
      .to(`USER_${client.data.user.sub}`)
      .emit('NOTIFICATION_ALL_READED', {
        unread_count,
      });
  }

  @SubscribeMessage('DELETE_ONE_NOTIFICATION')
  async onDeleteOneNotification(
    @ConnectedSocket() client: Socket,
    @MessageBody() notification_id: string,
  ) {
    await this.notifyService.deleteOneNotification(
      client.data.user.sub,
      notification_id,
    );

    this.server
      .to(`USER_${client.data.user.sub}`)
      .emit('NOTIFICATION_DELETED', {
        notification_id,
      });
  }

  @SubscribeMessage('DELETE_ALL_NOTIFICATION')
  async onDeleteAllNotification(@ConnectedSocket() client: Socket) {
    const affected = await this.notifyService.deleteAllReadNotifications(
      client.data.user.sub,
    );

    this.server
      .to(`USER_${client.data.user.sub}`)
      .emit('ALL_NOTIFICATION_DELETED', {
        affected,
      });
  }

  /**
   * โหลดประวัติข้อความของห้องเมื่อเปิดแชท และ เวลาเลื่อนขี้นสุด
   */
  @Roles(Role.USER, Role.SUPPORT)
  @UseGuards(WsCheckRole)
  @SubscribeMessage('LOAD_MESSAGE')
  async onLoadMessages(
    @MessageBody() dto: LoadMessagesDTO,
    @ConnectedSocket() client: Socket,
  ) {
    const newMessages = await this.messageService.loadMessage(
      client.data.user.sub,
      dto,
    );

    // ส่ง 10 message ล่าสุดกลับไป
    this.server
      .to(`ROOM_${dto.conversation_id}`)
      .emit('LOADING_MESSAGE', newMessages);
  }

  /**
   * เมื่อ Support, User, Admin login > จะ join เข้าห้องของตัวเอง
   */
  @Roles(Role.SUPPORT, Role.USER, Role.ADMIN)
  @UseGuards(WsCheckRole)
  @SubscribeMessage('JOIN_INTO_ROOM')
  async onAuthorization(@ConnectedSocket() client: Socket) {
    const user = client.data.user;
    switch (user.role) {
      case Role.SUPPORT: {
        client.join('SUPPORT_ROOM');
      }
      case Role.USER: {
        client.join(`USER_${client.data.user.sub}`);
      }
      case Role.ADMIN: {
        client.join(`ADMIN_ROOM`);
      }
    }
  }
}
