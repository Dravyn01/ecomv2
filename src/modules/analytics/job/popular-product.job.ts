import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/config/entities.config';
import { Repository } from 'typeorm';

@Injectable()
export class PopularProductJob {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  @Cron('*/10 * * * * *')
  // @Cron(CronExpression.EVERY_HOUR)
  async handlePopularityScoreUpdate() {
    const products = await this.productRepo.find();
    for (const product of products) {
      const score =
        product.sales_count * 0.4 +
        product.repeat_purchase_rate * 100 * 0.2 +
        Number(product.avg_rating) * 0.2 +
        product.wishlist_count * 0.1 +
        product.view_count * 0.05 -
        product.return_rate * 100 * 0.05;

      product.popularity_score = parseFloat(score.toFixed(2));
      await this.productRepo.save(product);
    }
  }
}
