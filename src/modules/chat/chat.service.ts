import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inbox } from './entities/inbox.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Inbox)
    private readonly inboxRepo: Repository<Inbox>,
  ) {}

  // ส่ง inbox ไปหา support (ถ้าเป็นข้อความแรก)
  async createInbox(sender_id: number, conversation_id: string) {
    // เช็คว่ามี inbox จาก sender นี้ กับ conversation นี้หรือยัง ถ้าไม่มีให้ส่ง ถ้ามีไม่ต้อง
    if (
      !(await this.inboxRepo.findOneBy({
        conversation: { id: conversation_id },
        sender: { id: sender_id },
      }))
    ) {
      // ส่ง inbox แรก
      await this.inboxRepo.save({
        conversation: { id: conversation_id },
        sender: { id: sender_id },
        is_open: false,
      });
    }
  }
}
