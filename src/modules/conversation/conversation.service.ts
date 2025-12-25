import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ConversationService {
  @InjectRepository(Conversation)
  private readonly conversationRepo: Repository<Conversation>;

  async checkOwnerConversation(
    user_id: number,
    conversation_id: string,
  ): Promise<boolean> {
    return await this.conversationRepo.existsBy({
      id: conversation_id,
      user: { id: user_id },
    });
  }

  async existsConversation(conversation_id: string): Promise<boolean> {
    return await this.conversationRepo.existsBy({ id: conversation_id });
  }

  async joinRoom(user_id: number): Promise<string> {
    const exists = await this.conversationRepo.findOne({
      where: { user: { id: user_id } },
    });

    if (exists) return exists.id;

    const newConversation = await this.conversationRepo.save({
      user: { id: user_id },
    });
    return newConversation.id;
  }
}
