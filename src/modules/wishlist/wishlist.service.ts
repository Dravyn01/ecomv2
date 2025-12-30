import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { Repository } from 'typeorm';
import { ProductService } from '../product/product.service';
import { AddToWishlistDto } from './dto/add-to-wishlist.dto';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepo: Repository<Wishlist>,
    private readonly productService: ProductService,
  ) {}

  async findAllByUser(user_id: string): Promise<Wishlist[]> {
    return await this.wishlistRepo.findBy({ user: { id: user_id } });
  }

  async create(user_id: string, body: AddToWishlistDto): Promise<Wishlist> {
    const product = await this.productService.findOne(body.product_id);
    return await this.wishlistRepo.save({
      user: { id: user_id },
      product: { id: product.id },
    });
  }

  async remove(user_id: string, product_id: string) {
    const product = await this.productService.findOne(product_id);
    await this.wishlistRepo.delete({
      user: { id: user_id },
      product: { id: product.id },
    });
  }
}
