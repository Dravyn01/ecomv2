import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reply } from './entities/reply.entity';
import { Message } from './entities/message.entity';
import { ConversationModule } from '../conversation/conversation.module';

@Module({
  imports: [TypeOrmModule.forFeature([Message, Reply]), ConversationModule],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
