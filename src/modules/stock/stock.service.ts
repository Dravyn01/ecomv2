import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { Stock, StockChangeType, StockMovement } from './entities/stock.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateMovement } from './dto/create-movement.stock';
import { ProductVariantService } from '../product-variant/product-variant.service';
import { Order, ProductVariant } from 'src/config/entities.config';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(Stock)
    private readonly stockRepo: Repository<Stock>,

    @InjectRepository(StockMovement)
    private readonly movementRepo: Repository<StockMovement>,

    @Inject(forwardRef(() => ProductVariantService))
    private readonly variantService: ProductVariantService,
  ) {}

  async findAll(): Promise<Stock[]> {
    return await this.stockRepo.find({ relations: ['movements'] });
  }

  async findByVariant(variant_id: number): Promise<Stock> {
    const stock = await this.stockRepo.findOne({
      where: {
        variant: { id: variant_id },
      },
      relations: {
        movements: true,
        variant: true,
      },
    });
    if (!stock) throw new NotFoundException('not found variant');
    return stock;
  }

  async createMovement(req: CreateMovement, tx: EntityManager) {
    const variant = await tx.findOneBy(ProductVariant, { id: req.variant_id });
    if (!variant) throw new NotFoundException('not found product');

    const stock = await tx.findOneBy(Stock, { variant: { id: variant.id } });
    if (!stock) throw new NotFoundException('not found stock');

    if (req.change_type === StockChangeType.IN) {
      stock.quantity += req.quantity;

      await tx.save(StockMovement, {
        stock: { id: stock.id },
        quantity: req.quantity,
        change_type: StockChangeType.IN,
        note: `Import product #${variant.id}, quantity ${req.quantity}`,
      });
    }

    if (req.change_type === StockChangeType.OUT) {
      const order = await tx.findOneBy(Order, { id: req.order_id });
      const stock = await tx.findOneBy(Stock, {
        variant: { id: req.variant_id },
      });

      if (!stock)
        throw new NotFoundException('find stock by variant id is not found');

      if (stock.quantity < req.quantity) {
        throw new BadRequestException();
      }

      const q = (stock.quantity -= req.quantity);
      await tx.save(Stock, { ...stock, quantity: q });

      await tx.save(StockMovement, {
        stock: { id: stock.id },
        quantity: q,
        change_type: StockChangeType.OUT,
        note: order ? `Order #${order.id}` : req.note,
        ...(order && { order: { id: order.id } }),
      });
    }

    if (req.change_type === StockChangeType.RETURN) {
      await tx.save(Stock, {
        ...stock,
        quantity: (stock.quantity += req.quantity),
      });
      await tx.save(StockMovement, {
        stock: { id: stock.id },
        change_type: StockChangeType.OUT,
        quantity: req.quantity,
        note: `Order Return ${req.order_id}`,
      });
    }
  }
}
