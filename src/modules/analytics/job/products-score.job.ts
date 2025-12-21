import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductStats } from '../entities/product-stats.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductsScoreCron {
  constructor(
    @InjectRepository(ProductStats)
    private readonly statsRepo: Repository<ProductStats>,
  ) {}

  // @Cron(CronExpression.EVERY_MINUTE)
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async handlePopularityScore() {
    const maxRow = await this.statsRepo
      .createQueryBuilder('s')
      .select([
        'MAX(s.view_count) as max_view',
        'MAX(s.wishlist_count) as max_wishlist',
        'MAX(s.total_quantity_sold) as max_sold',
        'MAX(s.total_revenue) as max_revenue',
        'MAX(s.avg_rating) as max_rating',
        'MAX(s.repeat_rate) as max_repeat',
        'MAX(s.return_rate) as max_return',
      ])
      .getRawOne();

    console.log('maxRow', maxRow);
  }
}
