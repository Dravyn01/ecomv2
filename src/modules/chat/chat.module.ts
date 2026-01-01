import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { Inbox } from './entities/inbox.entity';
import { NotificationModule } from '../notification/notification.module';
import { MessageModule } from '../message/message.module';
import { ConversationModule } from '../conversation/conversation.module';
import { ImageModule } from '../image/image.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Inbox]),
    NotificationModule,
    MessageModule,
    ConversationModule,
    ImageModule,
  ],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
