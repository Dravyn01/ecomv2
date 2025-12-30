import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { CreateMessageDTO } from './dto/create-message.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, LessThan, Not, Repository } from 'typeorm';
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

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    @InjectRepository(Replies)
    private readonly replyRepo: Repository<Replies>,
    private readonly conversationService: ConversationService,
  ) {}

  async createMessage(
    user: JwtPayload,
    dto: CreateMessageDTO,
  ): Promise<Message> {
    const newMessage = await this.messageRepo.manager.transaction(
      async (manager) => {
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
        return manager.getRepository(Message).save({
          conversation: { id: dto.conversation_id },
          sender: { id: user.sub },
          text: dto.text,
          ...(dto.image_urls?.length !== 0 && { image_urls: dto.image_urls }),
        });
      },
    );

    return newMessage;
  }

  async updateMessage(user_id: string, dto: UpdateMessageDTO): Promise<void> {
    const updatedResult = await this.messageRepo.update(
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

    if (updatedResult.affected === 0) {
      throw new ForbiddenException('เกิดข้อผิดพลาด ไม่สามารถแก้ไขข้อความได้');
    }
  }

  async deleteMessage(user_id: string, dto: DeleteMessageDTO): Promise<void> {
    let deleteResult: DeleteResult | null;

    if (dto.message_id) {
      deleteResult = await this.messageRepo.delete({
        id: dto.message_id,
        sender: { id: user_id },
        conversation: { id: dto.conversation_id },
      });
    } else if (dto.reply_id) {
      deleteResult = await this.replyRepo.delete({
        id: dto.reply_id,
        sender: { id: user_id },
        conversation: { id: dto.conversation_id },
      });
    } else {
      throw new BadRequestException(
        'ไม่สามารถลบข้อความได้เนื่องจากไม่พบ message_id หรือ reply_id',
      );
    }

    if (deleteResult.affected === 0) {
      throw new ForbiddenException('เกิดข้อผิดพลาด ไม่สามารถลบข้อความได้');
    }
  }

  async deleteImage(user_id: string, dto: DeleteMessageDTO): Promise<void> {
    // TODO: ลบรูป with image_id
    // const updateResult = await this.messageRepo.update(
    //   {
    //     id: dto.message_id,
    //     conversation: { id: dto.conversation_id },
    //     sender: { id: user_id },
    //   },
    //   {
    //     images: [],
    //   },
    // );
    // if (updateResult.affected === 0) {
    //   throw new ForbiddenException('เกิดข้อผิดพลาด ไม่สามารถลบรูปภาพได้');
    // }
  }

  async deleteReply(user_id: string, dto: DeleteReplyDTO) {
    const deleteResult = await this.messageRepo.delete({
      id: dto.reply_id,
      sender: { id: user_id },
      conversation: { id: dto.conversation_id },
    });

    if (deleteResult.affected === 0) {
      throw new ForbiddenException('เกิดข้อผิดพลาด ไม่สามารถลบข้อความได้');
    }
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
    // check permission
    if (sender.role !== Role.SUPPORT) {
      const isOwner = await this.conversationService.checkOwnerConversation(
        sender.sub,
        dto.conversation_id,
      );

      if (!isOwner) throw new ForbiddenException();
    }

    // เช็คว่าข้อความที่จะตอบกลับเป็นข้อความที่อยู่ใน conversation นี้
    const isMessageInConversation = await this.messageRepo.existsBy({
      id: dto.message_id,
      conversation: { id: dto.conversation_id },
    });

    if (!isMessageInConversation) throw new ForbiddenException();

    return await this.replyRepo.save({
      conversation: { id: dto.conversation_id },
      message: { id: dto.message_id },
      sender: { id: sender.sub },
      text: dto.text,
      ...(dto.image_urls && dto.image_urls.length > 1
        ? { image_urls: dto.image_urls }
        : {}),
    });
  }

  async updateReplyMessage(sender: JwtPayload, dto: UpdateReplyDTO) {
    const updatedResult = await this.replyRepo.update(
      {
        conversation: { id: dto.conversation_id },
        message: { id: dto.message_id },
        sender: { id: sender.sub },
      },
      {
        text: dto.text,
      },
    );

    if (updatedResult.affected === 0) {
      throw new ForbiddenException();
    }
  }
}
