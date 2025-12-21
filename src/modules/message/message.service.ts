import { ForbiddenException } from '@nestjs/common';
import { CreateMessageDTO } from './dto/create-message.dto';
import { Message, Role } from 'src/config/entities.config';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThan, Repository } from 'typeorm';
import { ChatService } from '../chat/chat.service';
import { JwtPayload } from 'src/common/strategies/jwt.strategy';
import { Injectable } from '@nestjs/common';
import { UpdateMessageDTO } from './dto/update-message.dto';
import { DeleteMessageDTO } from './dto/delete-message.dto';
import { ReadMessageDTO } from './dto/read-message.dto';
import { LoadMessages } from './dto/load-messages.dto';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    private readonly chatService: ChatService,
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
          const isOwner = await this.chatService.checkOwnerConversation(
            dto.conversation_id,
            user.sub,
          );
          if (!isOwner)
            throw new ForbiddenException('คุณไม่มีสิทธิ์ส่งข้อความในห้องนี้');
        }

        // save message
        return manager.getRepository(Message).save({
          conversation: { id: dto.conversation_id },
          sender: { id: user.sub },
          text: dto.text,
          ...(dto.image_urls && { image_urls: dto.image_urls }),
        });
      },
    );

    return newMessage;
  }

  async updateMessage(user_id: number, dto: UpdateMessageDTO): Promise<void> {
    const updatedResult = await this.messageRepo.update(
      {
        id: dto.message_id,
        sender: { id: user_id },
        conversation: { id: dto.conversation_id },
      },
      {
        ...(dto.text && { text: dto.text }),
        edit_at: new Date(),
      },
    );

    if (updatedResult.affected === 0) {
      throw new ForbiddenException('เกิดข้อผิดพลาด ไม่สามารถแก้ไขข้อความได้');
    }
  }

  async deleteMessage(user_id: number, dto: DeleteMessageDTO): Promise<void> {
    const deleteResult = await this.messageRepo.delete({
      id: dto.message_id,
      sender: { id: user_id },
      conversation: { id: dto.conversation_id },
    });

    if (deleteResult.affected === 0) {
      throw new ForbiddenException('เกิดข้อผิดพลาด ไม่สามารถลบข้อความได้');
    }
  }

  async deleteImage(user_id: number, dto: DeleteMessageDTO): Promise<void> {
    const updateResult = await this.messageRepo.update(
      {
        id: dto.message_id,
        conversation: { id: dto.conversation_id },
        sender: { id: user_id },
      },
      {
        image_urls: undefined,
      },
    );

    if (updateResult.affected === 0) {
      throw new ForbiddenException('เกิดข้อผิดพลาด ไม่สามารถลบรูปภาพได้');
    }
  }

  async readMessage(user_id: number, dto: ReadMessageDTO): Promise<void> {
    const isOwner = await this.chatService.checkOwnerConversation(
      dto.conversation_id,
      user_id,
    );

    if (!isOwner) {
      throw new ForbiddenException('คุณไม่ใช่เจ้าของห้องนี้');
    }

    await this.messageRepo.update(
      { id: In(dto.message_ids), conversation: { id: dto.conversation_id } },
      { is_read: true },
    );
  }

  async loadMessage(user: JwtPayload, dto: LoadMessages): Promise<Message[]> {
    if (user.role === Role.USER) {
      const isOwner = await this.chatService.checkOwnerConversation(
        dto.conversation_id,
        user.sub,
      );

      if (!isOwner) {
        throw new ForbiddenException('คุณไม่ใช่เจ้าของห้องนี้');
      }
    }

    if (user.role === Role.SUPPORT || user.role === Role.USER) {
      const newMessages = this.messageRepo.find({
        where: {
          ...(dto.befor_message_id
            ? { id: LessThan(dto.befor_message_id) }
            : {}),
          conversation: { id: dto.conversation_id },
        },
        take: 10,
        order: { createdAt: 'DESC' },
      });

      return newMessages;
    }

    throw new ForbiddenException('คุณไม่มีสิทธิ์โหลดข้อความในห้องสนทนานี้');
  }
}
