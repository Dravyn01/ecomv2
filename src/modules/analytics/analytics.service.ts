import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserPurchaseHistory } from './entities/user-purchase-history.entity';
import { Repository } from 'typeorm';
import { Order, OrderItem, Product } from 'src/config/entities.config';
import { OrderStatus } from '../order/enums/order-status.enum';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(UserPurchaseHistory)
    private readonly purchaseRepo: Repository<UserPurchaseHistory>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  create(createAnalyticsDto: any) {
    return 'This action adds a new analytics';
  }

  async showPurchaseHistory() {
    const purchase = await this.purchaseRepo.find();
    console.log(purchase.length);
    return purchase;
  }

  async getSalesSummary(product_id: number) {
    const items = await this.orderItemRepo.find({
      where: {
        variant: { product: { id: product_id } },
        order: {
          status: OrderStatus.PAID,
        },
      },
      relations: {
        variant: {
          product: true,
        },
      },
    });

    console.log(`items by ${product_id}`, items);

    const sales_count = items.reduce((sum, item) => {
      return (sum = item.variant.product.sales_count);
    }, 0);

    const base_price = items.reduce((sum, item) => {
      return (sum = item.variant.product.base_price);
    }, 0);

    console.log('sales_count:', sales_count);
    console.log('base_price:', base_price);
  }

  update(id: number, updateAnalyticsDto: any) {
    return `This action updates a #${id} analytics`;
  }

  remove(id: number) {
    return `This action removes a #${id} analytics`;
  }
}
