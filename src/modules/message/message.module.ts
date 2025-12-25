import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Replies } from './entities/reply.entity';
import { Message } from './entities/message.entity';
import { ConversationModule } from '../conversation/conversation.module';

@Module({
  imports: [TypeOrmModule.forFeature([Message, Replies]), ConversationModule],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
