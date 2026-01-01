import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { CreateMessageDTO } from './dto/create-message.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThan, Repository } from 'typeorm';
import { JwtPayload } from 'src/common/strategies/jwt.strategy';
import { Injectable } from '@nestjs/common';
import { UpdateMessageDTO } from './dto/update-message.dto';
import { DeleteMessageDTO } from './dto/delete-message.dto';
import { ReadMessageDTO } from './dto/read-message.dto';
import { LoadMessages } from './dto/load-messages.dto';
import { CreateReplyDTO } from './dto/create-reply.dto';
import { DeleteReplyDTO } from './dto/delete-reply.dto';
import { ConversationService } from '../conversation/conversation.service';
import { UpdateReplyDTO } from './dto/update-reply.dto';
import { DeleteResult } from 'typeorm/browser';
import { Message } from './entities/message.entity';
import { Replies } from './entities/reply.entity';
import { Role } from '../user/entities/user.entity';
import { ImageOwnerType } from '../image/entities/image.entity';
import { ImageService } from '../image/image.service';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    @InjectRepository(Replies)
    private readonly replyRepo: Repository<Replies>,
    private readonly conversationService: ConversationService,
    private readonly imageService: ImageService,
  ) {}

  async createMessage(
    user: JwtPayload,
    dto: CreateMessageDTO,
  ): Promise<Message> {
    const newMessage = await this.messageRepo.manager.transaction(
      async (tx) => {
        // ถ้าใช่ SUPPORT ให้ไปต่อ
        if (user.role !== Role.SUPPORT) {
          // ถ้าไม่ใช่ SUPPORT เช็คว่าเป็นเจ้าของห้องไหม
          const isOwner = await this.conversationService.checkOwnerConversation(
            user.sub,
            dto.conversation_id,
          );
          if (!isOwner)
            throw new ForbiddenException('คุณไม่มีสิทธิ์ส่งข้อความในห้องนี้');
        }

        // save message
        const message = await tx.save(Message, {
          conversation: { id: dto.conversation_id },
          sender: { id: user.sub },
          text: dto.text,
        });

        if (dto.images?.length) {
          for (const image of dto.images) {
            await this.imageService.createImage({
              image,
              owner_id: message.id,
              owner_type: ImageOwnerType.MESSAGE,
              tx,
            });
          }
        }

        return message;
      },
    );

    return newMessage;
  }

  async updateMessage(user_id: string, dto: UpdateMessageDTO): Promise<void> {
    await this.messageRepo.update(
      {
        id: dto.message_id,
        sender: { id: user_id },
        conversation: { id: dto.conversation_id },
      },
      {
        ...(dto.text && { text: dto.text }),
        updated_at: new Date(),
      },
    );
  }

  async deleteMessage(user_id: string, dto: DeleteMessageDTO): Promise<void> {
    if (dto.message_id) {
      await this.messageRepo.delete({
        id: dto.message_id,
        sender: { id: user_id },
        conversation: { id: dto.conversation_id },
      });
    } else if (dto.reply_id) {
      await this.replyRepo.delete({
        id: dto.reply_id,
        sender: { id: user_id },
        conversation: { id: dto.conversation_id },
      });
    } else {
      throw new BadRequestException(
        'ไม่สามารถลบข้อความได้เนื่องจากไม่พบ message_id หรือ reply_id',
      );
    }
  }

  async deleteReply(user_id: string, dto: DeleteReplyDTO) {
    await this.messageRepo.delete({
      id: dto.reply_id,
      sender: { id: user_id },
      conversation: { id: dto.conversation_id },
    });
  }

  async readMessage(user: JwtPayload, dto: ReadMessageDTO): Promise<void> {
    if (user.role !== Role.SUPPORT) {
      const isOwner = await this.conversationService.checkOwnerConversation(
        user.sub,
        dto.conversation_id,
      );

      if (!isOwner) {
        throw new ForbiddenException('คุณไม่ใช่เจ้าของห้องนี้');
      }
    }

    await this.messageRepo.update(
      { id: In(dto.message_ids), conversation: { id: dto.conversation_id } },
      { read_at: new Date() },
    );
  }

  async loadMessage(user: JwtPayload, dto: LoadMessages): Promise<Message[]> {
    if (user.role !== Role.SUPPORT) {
      const isOwner = await this.conversationService.checkOwnerConversation(
        user.sub,
        dto.conversation_id,
      );

      if (!isOwner) {
        throw new ForbiddenException('คุณไม่ใช่เจ้าของห้องนี้');
      }
    }

    // WARN: now message_id is uuid
    return await this.messageRepo.find({
      where: {
        ...(dto.befor_message_id ? { id: LessThan(dto.befor_message_id) } : {}),
        conversation: { id: dto.conversation_id },
      },
      take: 10,
      order: { createdAt: 'DESC' },
    });
  }

  async createReplyMessage(sender: JwtPayload, dto: CreateReplyDTO) {
    // permission check
    if (sender.role !== Role.SUPPORT) {
      const isOwner = await this.conversationService.checkOwnerConversation(
        sender.sub,
        dto.conversation_id,
      );

      if (!isOwner) throw new ForbiddenException();
    }

    //2️⃣ check message belongs to conversation
    const isMessageInConversation = await this.messageRepo.existsBy({
      id: dto.message_id,
      conversation: { id: dto.conversation_id },
    });

    if (!isMessageInConversation) throw new ForbiddenException();

    await this.replyRepo.manager.transaction(async (tx) => {
      // create reply
      const reply = await tx.save(Replies, {
        conversation: { id: dto.conversation_id },
        message: { id: dto.message_id },
        sender: { id: sender.sub },
        text: dto.text,
      });

      // create images (if any)
      if (dto.images?.length) {
        for (const image of dto.images) {
          await this.imageService.createImage({
            image,
            owner_id: reply.id,
            owner_type: ImageOwnerType.MESSAGE,
            tx,
          });
        }
      }
    });
  }

  async updateReplyMessage(sender: JwtPayload, dto: UpdateReplyDTO) {
    await this.replyRepo.update(
      {
        conversation: { id: dto.conversation_id },
        message: { id: dto.message_id },
        sender: { id: sender.sub },
      },
      {
        text: dto.text,
      },
    );
  }
}
