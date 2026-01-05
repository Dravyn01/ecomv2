import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductStats } from '../entities/product-stats.entity';
import { Between, Repository } from 'typeorm';
import { getDate } from 'src/utils/get-date';
import { AnalyticsService } from '../analytics.service';
import { Review } from 'src/modules/review/entities/review.entity';
import { aggregateByProduct } from 'src/utils/aggrerate-by-product';

@Injectable()
export class ReviewsScoreCron {
  constructor(
    @InjectRepository(ProductStats)
    private readonly productStatsRepo: Repository<ProductStats>,
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
  ) {}

  // วันละ 2 รอบ (22:00 และ 02:00)
  @Cron('0 22 * * *')
  @Cron('0 2 * * *')
  async handleReview(): Promise<void> {
    const { start, end } = getDate();

    // รีวิววันนี้
    const reviewsToday = await this.reviewRepo.find({
      where: { created_at: Between(start, end) },
      relations: ['product'],
    });

    if (reviewsToday.length === 0) return; // ไม่มีรีวิววันนี้ → จบ

    const grouped = aggregateByProduct(
      reviewsToday,
      (r) => r.product.id,
      (acc, _) => {
        acc.review_count++;
      },
      () => ({ review_count: 0 }),
    );

    console.log('cron.review', grouped);

    const allReviews = await this.reviewRepo.find({
      select: ['rating'],
    });

    for (const [productId, data] of grouped.entries()) {
      const review_count = data.review_count;
      const newAvg =
        data.review_count === 0
          ? 0
          : Number(
              (
                allReviews.reduce((sum, r) => sum + r.rating, 0) / review_count
              ).toFixed(2),
            );

      await this.productStatsRepo.update(
        {
          product: { id: productId },
        },
        {
          review_count: data.review_count,
          avg_rating: newAvg,
        },
      );
    }
  }
}
