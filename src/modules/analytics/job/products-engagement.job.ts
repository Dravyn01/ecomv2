import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { ProductStats } from '../entities/product-stats.entity';
import { Wishlist } from 'src/config/entities.config';
import { ProductView } from '../entities/product-view.entity';
import { getDate } from 'src/utils/get-date';
import { AnalyticsService } from '../analytics.service';

@Injectable()
export class ProductsEngagementCron {
  constructor(
    @InjectRepository(ProductStats)
    private readonly productStatsRepo: Repository<ProductStats>,
    @InjectRepository(ProductView)
    private readonly productViewRepo: Repository<ProductView>,
    @InjectRepository(Wishlist)
    private readonly wishlistRepo: Repository<Wishlist>,
    private readonly analyticService: AnalyticsService,
  ) {}

  // รันทุก 6 ชั่วโมง
  @Cron('0 */6 * * *')
  async handlePopularity(): Promise<void> {
    const { start, end } = getDate();

    // views วันนี้
    const views = await this.productViewRepo.find({
      where: { created_at: Between(start, end) },
      relations: ['product'],
    });

    // wishlist วันนี้
    const wishlists = await this.wishlistRepo.find({
      where: { created_at: Between(start, end) },
      relations: ['product'],
    });

    this.analyticService.aggregateByProduct<Wishlist, { wishlist: 0; view: 0 }>(
      wishlists,
      (v) => v.product.id,
      (acc, _) => {
        acc.wishlist++;
      },
      () => ({ wishlist: 0, view: 0 }),
    );

    const grouped = this.analyticService.aggregateByProduct<
      ProductView,
      { wishlist: 0; view: 0 }
    >(
      views,
      (v) => v.product.id,
      (acc, _) => {
        acc.view++;
      },
      () => ({ wishlist: 0, view: 0 }),
    );

    console.log('cron.engagement', grouped);

    // update stats
    for (const [product_id, data] of grouped.entries()) {
      const { view, wishlist } = data;

      await this.productStatsRepo.save({
        product: { id: product_id },
        view_count: view,
        wishlist_count: wishlist,
      });
    }
  }
}
