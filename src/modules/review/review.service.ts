import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { EntityManager, Repository } from 'typeorm';
import { ProductVariantService } from '../product-variant/product-variant.service';
import { Order, ProductVariant } from 'src/config/entities.config';
import { OrderStatus } from '../order/enums/order-status.enum';
import { FindAllQuery } from 'src/common/dto/req/find-all.query';
import { UserService } from '../user/user.service';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
    private readonly variantService: ProductVariantService,
    private readonly userService: UserService,
    private readonly manager: EntityManager,
  ) {}

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
        variant: {
          product: {
            id: product_id,
          },
        },
      },
      skip: (page - 1) * limit,
      order: { created_at: order },
      take: limit,
    });
  }

  async create(body: CreateReviewDto): Promise<Review> {
    const variant = await this.variantService.findOne(body.variant_id);
    const user = await this.userService.findOne(body.user_id);

    const review = this.manager.transaction(async (tx) => {
      const hasPurchased = await tx.existsBy(Order, {
        user: { id: user.id },
        status: OrderStatus.PAID,
        items: {
          variant: { id: body.variant_id },
        },
      });

      if (!hasPurchased)
        throw new NotFoundException(
          `not found order Status Paid by user ${user.id}`,
        );

      const oldAverage = variant.product.avg_rating;
      const oldReviews = variant.product.review_count;

      console.log(
        `oldAverage&oldReviews: ${oldAverage}, oldReviews: ${oldReviews}`,
      );

      const newAverage =
        (oldAverage * oldReviews + body.rating) / (oldReviews + 1);

      console.log(`newAverage: ${newAverage}`);

      const review = await tx.save(Review, {
        user: { id: body.user_id },
        comment: body.comment,
        rating: body.rating,
      });

      const saved_product = await tx.save(ProductVariant, {
        id: body.variant_id,
        product: {
          id: variant.product.id,
          avg_rating: Number(newAverage.toFixed(2)),
          review_count: oldReviews + 1,
        },
      });

      console.log(saved_product);

      return review;
    });

    return review;
  }

  async delete(review_id: number): Promise<void> {
    await this.manager.transaction(async (tx) => {
      const review = await tx.findOneBy(Review, { id: review_id });
      if (!review) throw new NotFoundException('');

      if (!review.variant) {
        throw new NotFoundException('not found review or product');
      }

      const variant = await this.variantService.findOne(review.variant.id);

      const oldAverage = variant.product.avg_rating;
      const oldReviews = variant.product.review_count;

      const newAverage =
        (oldAverage * oldReviews + review.rating) / (oldReviews - 1);

      console.log('deleteAverage', newAverage);

      await tx.save(ProductVariant, {
        id: variant.id,
        product: {
          id: variant.product.id,
          avg_rating: newAverage,
          review_count: oldReviews - 1,
        },
      });

      await tx.delete(Review, review_id);
    });
  }
}
