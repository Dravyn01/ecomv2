import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { Stock, StockMovement } from './entities/stock.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateMovement } from './dto/create-movement.stock';
import { ProductVariant } from 'src/config/entities.config';
import { StockChangeType } from './enums/stock-change.enum';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(Stock)
    private readonly stockRepo: Repository<Stock>,
  ) {}

  async findAll(): Promise<Stock[]> {
    return await this.stockRepo.find({
      order: { id: 'ASC', movements: { created_at: 'DESC' } },
      relations: ['movements', 'variant'],
    });
  }

  async findByVariant(variant_id: number): Promise<Stock> {
    const stock = await this.stockRepo.findOne({
      where: { variant: { id: variant_id } },
      order: { id: 'ASC' },
      relations: ['movements', 'variant'],
    });
    if (!stock) throw new NotFoundException('not found variant');
    return stock;
  }

  async deleteMovement(movement_id: number) {
    await this.stockRepo.delete(movement_id);
  }

  // async createMovement(req: CreateMovement, tx: EntityManager) {
  //   const variant = await tx.findOne(ProductVariant, {
  //     where: {
  //       id: req.variant_id,
  //     },
  //     relations: {
  //       stock: true,
  //     },
  //   });
  //
  //   if (!variant) throw new NotFoundException('not found product');
  //
  //   if (!variant.stock) {
  //     await tx.save(Stock, {
  //       variant: { id: req.variant_id },
  //       quantity: 0,
  //     });
  //   }
  //
  //   const stock = await tx.findOneBy(Stock, { variant: { id: variant.id } });
  //   if (!stock)
  //     throw new NotFoundException(
  //       `not found stock of variant id ${req.variant_id}`,
  //     );
  //
  //   if (req.change_type === StockChangeType.IN) {
  //     stock.quantity += req.quantity;
  //     await tx.save(Stock, stock);
  //
  //     await tx.save(StockMovement, {
  //       stock: { id: stock.id },
  //       quantity: req.quantity,
  //       change_type: StockChangeType.IN,
  //       note: `Import product #${variant.id}, quantity ${req.quantity}`,
  //     });
  //   }
  //
  //   if (req.change_type === StockChangeType.OUT) {
  //     const order = await tx.findOneBy(Order, { id: req.order_id });
  //     const stock = await tx.findOneBy(Stock, {
  //       variant: { id: req.variant_id },
  //     });
  //
  //     if (!stock)
  //       throw new NotFoundException('find stock by variant id is not found');
  //
  //     if (stock.quantity < req.quantity) {
  //       throw new BadRequestException();
  //     }
  //
  //     stock.quantity -= req.quantity;
  //     await tx.save(stock);
  //
  //     await tx.save(StockMovement, {
  //       stock: { id: stock.id },
  //       quantity: req.quantity,
  //       change_type: StockChangeType.OUT,
  //       note: order ? `Order #${order.id}` : req.note,
  //       ...(order && { order: { id: order.id } }),
  //     });
  //   }
  //
  //   if (req.change_type === StockChangeType.RETURN) {
  //     await tx.save(Stock, {
  //       ...stock,
  //       quantity: (stock.quantity += req.quantity),
  //     });
  //     await tx.save(StockMovement, {
  //       stock: { id: stock.id },
  //       change_type: StockChangeType.RETURN,
  //       quantity: req.quantity,
  //       note: `Order Return #${req.order_id}`,
  //     });
  //   }
  //
  //   if (req.change_type === StockChangeType.ADJUST) {
  //     await tx.save(Stock, { ...stock, quantity: req.quantity });
  //     await tx.save(StockMovement, {
  //       stock: { id: stock.id },
  //       change_type: StockChangeType.ADJUST,
  //       quantity: req.quantity,
  //       note: req.note ? req.note : 'unknow',
  //     });
  //   }
  // }

  async createMovement(req: CreateMovement, tx: EntityManager) {
    const variant = await tx.findOne(ProductVariant, {
      where: { id: req.variant_id },
      relations: ['stock'],
    });
    if (!variant) throw new NotFoundException('not found product');

    // no have a stock. create stock
    if (!variant.stock) {
      await tx.save(Stock, { variant: { id: req.variant_id }, quantity: 0 });
    }

    const stock = await tx.findOneBy(Stock, { variant: { id: variant.id } });

    if (!stock)
      throw new NotFoundException(
        `not found stock of variant id ${req.variant_id}`,
      );

    const saved_movement = {
      stock: { id: stock.id },
      quantity: req.quantity,
      change_type: StockChangeType.IN,
      note:
        req.note ?? `Import product #${variant.id}, quantity ${req.quantity}`,
    };

    const shouldIncrease = [
      StockChangeType.IN,
      StockChangeType.ADJUST,
      StockChangeType.RETURN,
    ].includes(req.change_type);

    const saved_stock = {
      ...stock,
      quantity: shouldIncrease
        ? stock.quantity + req.quantity
        : stock.quantity - req.quantity,
    };

    console.log(saved_stock);

    console.log('have a note?', req.note);

    switch (req.change_type) {
      case StockChangeType.IN: {
        console.log(`[STATUS] "IN" ${req.quantity}`);
        await tx.save(Stock, saved_stock);
        await tx.save(StockMovement, saved_movement);
        return;
      }
      case StockChangeType.OUT: {
        console.log(`[STATUS] "${req.change_type}" ${req.quantity}`);

        console.log(stock.quantity);
        console.log(req.quantity);

        console.log(stock.quantity < req.quantity);
        if (stock.quantity < req.quantity) {
          throw new BadRequestException(
            `stock quantity lass req.quantity ${stock.quantity} < ${req.quantity}`,
          );
        }

        await tx.save(Stock, saved_stock);
        await tx.save(StockMovement, {
          ...saved_movement,
          change_type: StockChangeType.OUT,
          note: `Order #${req.order_id ?? 'unknow order'}`,
          ...(req.order_id && { order: { id: req.order_id } }),
        });
        return;
      }
      case StockChangeType.ADJUST: {
        console.log(`[STATUS] "ADJUST" ${req.quantity}`);
        await tx.save(Stock, saved_stock);
        await tx.save(StockMovement, {
          ...saved_movement,
          change_type: StockChangeType.ADJUST,
        });
        return;
      }
      case StockChangeType.RETURN: {
        console.log(`[STATUS] "RETURN" ${req.quantity}`);
        await tx.save(Stock, saved_stock);
        await tx.save(StockMovement, {
          ...saved_movement,
          note: `Return Order #${req.order_id ?? 'unknow'}`,
          change_type: StockChangeType.RETURN,
        });
        return;
      }
    }
  }
}
