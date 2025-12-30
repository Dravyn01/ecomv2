import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReviewDTO } from './dto/create-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { EntityManager, Repository } from 'typeorm';
import { OrderStatus } from '../order/enums/order-status.enum';
import { FindAllQuery } from 'src/common/dto/req/find-all.query';
import { UserService } from '../user/user.service';
import { Order } from '../order/entities/order.entity';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,

    private readonly userService: UserService,
    private readonly manager: EntityManager,
  ) {}

  // # DEBUG
  async findAll(): Promise<Review[]> {
    return await this.reviewRepo.find();
  }

  async findByProduct(
    product_id: string,
    query: FindAllQuery,
  ): Promise<Review[]> {
    const { page, limit, order } = query;

    return await this.reviewRepo.find({
      where: {
        product: {
          id: product_id,
        },
      },
      skip: (page - 1) * limit,
      order: { created_at: order },
      take: limit,
    });
  }

  async create(user_id: string, body: CreateReviewDTO): Promise<Review> {
    const user = await this.userService.findOne(user_id);

    const review = this.manager.transaction(async (tx) => {
      // หา order ที่สั่งซื้อสำเร็จ และ product_id ตรงกัลใน order ที่สั่ง
      const hasPurchased = await tx.existsBy(Order, {
        user: { id: user.id },
        status: OrderStatus.PAID,
        items: {
          variant: { id: body.variant_id },
        },
      });

      // ถ้า client ส่งค่ามาไม่ถูกต้องให้แจ้ง error ไป(remessage in feature)
      if (!hasPurchased)
        throw new NotFoundException(
          `not found order Status Paid by user ${user.id}`,
        );

      // สร้างรีวิวใหม่
      return await tx.save(Review, {
        user: { id: user_id },
        comment: body.comment,
        rating: body.rating,
        // image_url: body.,
      });
    });

    return review;
  }

  async delete(review_id: string): Promise<void> {
    await this.reviewRepo.delete(review_id);
  }
}
