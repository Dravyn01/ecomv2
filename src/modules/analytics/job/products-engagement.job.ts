import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { ProductStats } from '../entities/product-stats.entity';
import { Wishlist } from 'src/config/entities.config';
import { ProductView } from '../entities/product-view.entity';
import { getDate } from 'src/utils/get-date';

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
    const wishlist = await this.wishlistRepo.find({
      where: { created_at: Between(start, end) },
      relations: ['product'],
    });

    // ใช้ map grouping
    const grouped = new Map<number, { views: number; wishlist: number }>();

    // รวม views
    for (const v of views) {
      const id = v.product.id;
      if (!grouped.has(id)) {
        grouped.set(id, { views: 0, wishlist: 0 });
      }
      grouped.get(id)!.views++;
    }

    // รวม wishlist
    for (const w of wishlist) {
      const id = w.product.id;
      if (!grouped.has(id)) {
        grouped.set(id, { views: 0, wishlist: 0 });
      }
      grouped.get(id)!.wishlist++;
    }

    // update stats
    for (const [product_id, data] of grouped.entries()) {
      const { views, wishlist } = data;

      await this.productStatsRepo.save({
        product: { id: product_id },
        view_count: views,
        wishlist_count: wishlist,
      });
    }
  }
}
