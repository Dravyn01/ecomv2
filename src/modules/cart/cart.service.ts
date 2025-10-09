import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from 'src/config/entities.config';
import { FindAllCartsDto } from './dto/req/find-all-carts.query';
import { CartsRes } from './dto/res/carts.res';
import { Repository } from 'typeorm';

@Injectable()
export class CartService {
  private readonly className = this.constructor.name;
  private readonly logger = new Logger(CartService.name);

  constructor(
    @InjectRepository(Cart) private readonly cartRepo: Repository<Cart>,
  ) {}

  async findAll(req: FindAllCartsDto): Promise<CartsRes> {
    const { page, limit, order } = req;

    const [carts, count] = await this.cartRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { added_at: order },
    });

    this.logger.log(`found carts "${count}"`);

    return { carts, count } as CartsRes;
  }

  async findOne(cart_id): Promise<Cart> {
    const existing = await this.cartRepo.findOneBy({ id: cart_id });
    if (!existing) {
      throw new NotFoundException('not found cart');
    }
    return existing;
  }

  async createCart() {}
}
