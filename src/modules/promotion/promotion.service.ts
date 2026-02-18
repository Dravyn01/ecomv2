import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Promotion,
  PromotionType,
  DiscountType,
} from './entities/promotion.entity';
import { Order, OrderItem } from '../order/entities/order.entity';
import { CartItem } from '../cart/entities/cart.entity';

export interface PromotionPreviewResult {
  promotion_id: string;
  code: string;
  discount_total: number;
  final_total: number;
}

export interface ValidatedPromotionResult {
  promotion: Promotion;
  discount: number;
}

@Injectable()
export class PromotionService {
  constructor(
    @InjectRepository(Promotion)
    private readonly promotionRepo: Repository<Promotion>,
  ) {}

  /**
   * preview promotion
   *
   * ใช้กับ cart / product page
   *
   * preview ราคาหลังลดหลังกดชำระเงิน (ก่อนสร้าง order )
   */
  async previewPromotion(
    items: CartItem[],
    code: string,
  ): Promise<PromotionPreviewResult | null> {
    const promotion = await this.getActivePromotionByCode(code);

    this.validatePromotionTime(promotion);

    const discount = this.calculateDiscount(promotion, items);
    const subtotal = this.sumItems(items);

    return {
      promotion_id: promotion.id,
      code: promotion.code,
      discount_total: discount,
      final_total: subtotal - discount,
    };
  }

  /**
   * ใช้ตอน checkout
   *
   * โค้ดนี้:
   * - เช็คว่าโปรโมซั่นหมดยัง
   * - เช็คว่าโค้ดนี้ถึง limit ยัง
   *
   * @throws
   *  - โปรโมซั่นหมดเวลา
   *  - โปรโมชั่นถึง limit
   *
   * @returns {
   *  promotion
   *  discount
   * }
   */
  async validateForCheckout(
    items: CartItem[],
    code: string,
  ): Promise<{ promotion: Promotion; discount: number }> {
    const promotion = await this.getActivePromotionByCode(code);

    this.validatePromotionTime(promotion);
    this.validateUsageLimit(promotion);

    const discount = this.calculateDiscount(promotion, items);

    return {
      promotion,
      discount,
    };
  }

  /**
   * เรียกหลังสร้างออลเดอร์เสร็จ
   */
  async applyToOrder(
    order: Order,
    promotion: Promotion,
    discount: number,
  ): Promise<void> {
    // freeze ราคาสุดท้าย
    order.total_price = Number(order.total_price) - discount;

    // increment usage
    promotion.used_count += 1;

    await this.promotionRepo.save(promotion);
  }

  // CORE LOGIC
  private calculateDiscount(promotion: Promotion, items: CartItem[]): number {
    // ราคารวมของ item
    const subtotal = this.sumItems(items);

    if (promotion.min_order_amount && subtotal < promotion.min_order_amount) {
      throw new BadRequestException('Order amount not eligible for promotion');
    }

    switch (promotion.type) {
      case PromotionType.DISCOUNT:
        return this.calculateDiscountByType(promotion, subtotal);

      default:
        throw new BadRequestException('Promotion type not supported yet');
    }
  }

  private calculateDiscountByType(
    promotion: Promotion,
    subtotal: number,
  ): number {
    if (!promotion.discount_type || !promotion.discount_value) {
      throw new BadRequestException('Invalid discount configuration');
    }

    let discount = 0;

    if (promotion.discount_type === DiscountType.PERCENT) {
      discount = (subtotal * Number(promotion.discount_value)) / 100;
    }

    if (promotion.discount_type === DiscountType.FIXED) {
      discount = Number(promotion.discount_value);
    }

    if (promotion.max_discount) {
      discount = Math.min(discount, Number(promotion.max_discount));
    }

    return Math.max(discount, 0);
  }

  // VALIDATION
  private validatePromotionTime(promotion: Promotion) {
    const now = new Date();

    if (now < promotion.start_at || now > promotion.end_at) {
      throw new BadRequestException('Promotion expired');
    }

    if (!promotion.is_active) {
      throw new BadRequestException('Promotion inactive');
    }
  }

  private validateUsageLimit(promotion: Promotion) {
    if (
      promotion.usage_limit > 0 &&
      promotion.used_count >= promotion.usage_limit
    ) {
      throw new BadRequestException('Promotion usage limit reached');
    }
  }

  // QUERY
  private async getActivePromotionByCode(code: string): Promise<Promotion> {
    const promotion = await this.promotionRepo.findOne({
      where: { code },
    });

    if (!promotion) {
      throw new BadRequestException('Promotion not found');
    }

    return promotion;
  }

  // UTIL
  private sumItems(items: CartItem[]): number {
    return items.reduce(
      (sum, item) => sum + item.variant.price * item.quantity,
      0,
    );
  }
}
