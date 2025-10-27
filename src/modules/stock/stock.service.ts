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

  async createMovement(req: CreateMovement, tx: EntityManager) {
    console.log('createMovement start');
    console.log('rewq', req);
    const variant = await tx.findOne(ProductVariant, {
      where: { id: req.variant_id },
      relations: ['stock'],
    });
    if (!variant) throw new NotFoundException('not found product');

    let stock = variant.stock;
    if (!stock) {
      // create if no existing stock
      stock = await tx.save(Stock, {
        variant: { id: req.variant_id },
        quantity: 0,
      });
    }

    let newQuantity = stock.quantity;

    if (
      req.change_type === StockChangeType.IN ||
      req.change_type === StockChangeType.RETURN
    ) {
      console.log('CASE IN OR RETURN');
      newQuantity += req.quantity;
    } else if (req.change_type === StockChangeType.OUT) {
      newQuantity -= req.quantity;
      console.log('CASE OUT');
      if (stock.quantity < req.quantity)
        throw new BadRequestException(
          `stock quantity lass req.quantity ${stock.quantity} < ${req.quantity}`,
        );
    } else if (req.change_type === StockChangeType.ADJUST) {
      console.log('CASE ADJUST');
      newQuantity += req.quantity;
      if (newQuantity < 0) newQuantity = 0;
    }

    console.log(`END OF CASE "${req.change_type}"`);

    const defaultNote = {
      [StockChangeType.IN]: `Import product #${variant.id}, quantity: ${variant.id}`,
      [StockChangeType.OUT]: `Order #${req.order_id}`,
      [StockChangeType.ADJUST]: `Adjust product #${variant.id}, quantity: ${variant.id}`,
      [StockChangeType.RETURN]: `Import product #${variant.id}, quantity: ${variant.id}`,
    };

    const saved_stock = { ...stock, quantity: newQuantity };

    const saved_movement = {
      stock: { id: stock.id },
      quantity: req.quantity,
      change_type: req.change_type,
      note: req.note ?? defaultNote[req.change_type],
      ...(req.order_id && { order: { id: req.order_id } }),
    };

    await tx.save(Stock, saved_stock);
    await tx.save(StockMovement, saved_movement);
  }
}
