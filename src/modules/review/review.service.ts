import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { EntityManager, Repository } from 'typeorm';
import { Order, Product } from 'src/config/entities.config';
import { OrderStatus } from '../order/enums/order-status.enum';
import { FindAllQuery } from 'src/common/dto/req/find-all.query';
import { UserService } from '../user/user.service';
import { ProductService } from '../product/product.service';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,

    // services
    private readonly productService: ProductService,
    private readonly userService: UserService,
    private readonly manager: EntityManager,
  ) {}

  // TODO: add logger

  // DEBUG
  async findAll(): Promise<Review[]> {
    return await this.reviewRepo.find();
  }

  async findByProduct(
    product_id: number,
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

  /*
   *
   *
   * TODO: add flow logic
   *
   *
   * */
  async create(body: CreateReviewDto): Promise<Review> {
    const product = await this.productService.findOne(body.variant_id);
    const user = await this.userService.findOne(body.user_id);

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

      // ค่าฉะเสี่ยและ review ทั้งหมดของรอบก่อน
      const oldAverage = product.avg_rating;
      const oldReviews = product.review_count;

      console.log(
        `oldAverage&oldReviews: ${oldAverage}, oldReviews: ${oldReviews}`,
      );

      // คำนวนค่าฉะเสี่ยใหม่
      const newAverage =
        (oldAverage * oldReviews + body.rating) / (oldReviews + 1);

      // สร้างรีวิวใหม่
      const newReview = await tx.save(Review, {
        user: { id: body.user_id },
        comment: body.comment,
        rating: body.rating,
        product: {
          id: product.id,
          avg_rating: Number(newAverage.toFixed(2)),
          review_count: oldReviews + 1,
        },
      });

      return newReview;
    });

    return review;
  }

  /*
   *
   *
   * TODO: add flow logic
   *
   *
   * */
  async delete(review_id: number): Promise<void> {
    await this.manager.transaction(async (tx) => {
      const review = await tx.findOneBy(Review, { id: review_id });
      if (!review) throw new NotFoundException('');

      if (!review.product) {
        throw new NotFoundException('not found review or product');
      }

      const product = await this.productService.findOne(review.product.id);

      const oldAverage = product.avg_rating;
      const oldReviews = product.review_count;

      const newAverage =
        (oldAverage * oldReviews + review.rating) / (oldReviews - 1);

      console.log('deleteAverage', newAverage);

      await tx.save(Product, {
        id: product.id,
        product: {
          id: product.id,
          avg_rating: newAverage,
          review_count: oldReviews - 1,
        },
      });

      await tx.delete(Review, review_id);
    });
  }
}
