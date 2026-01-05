import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { ProductStats } from '../entities/product-stats.entity';
import { ProductView } from '../entities/product-view.entity';
import { getDate } from 'src/utils/get-date';
import { Wishlist } from 'src/modules/wishlist/entities/wishlist.entity';
import { aggregateByProduct } from 'src/utils/aggrerate-by-product';

@Injectable()
export class ProductsEngagementCron {
  constructor(
    @InjectRepository(ProductStats)
    private readonly productStatsRepo: Repository<ProductStats>,
    @InjectRepository(ProductView)
    private readonly productViewRepo: Repository<ProductView>,
    @InjectRepository(Wishlist)
    private readonly wishlistRepo: Repository<Wishlist>,
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

    aggregateByProduct(
      wishlists,
      (v) => v.product.id,
      (acc, _) => {
        acc.wishlist++;
      },
      () => ({ wishlist: 0, view: 0 }),
    );

    const grouped = aggregateByProduct(
      views,
      (v) => v.product.id,
      (acc, _) => {
        acc.view++;
      },
      () => ({ wishlist: 0, view: 0 }),
    );

    // update stats
    for (const [product_id, data] of grouped.entries()) {
      const { view, wishlist } = data;

      await this.productStatsRepo.update(
        {
          product: { id: product_id },
        },
        {
          view_count: view,
          wishlist_count: wishlist,
        },
      );
    }
  }
}
