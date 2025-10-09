import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Color } from './entities/color.entity';
import { CreateColorReq } from './dto/req/create-color.req';
import { UpdateColorReq } from './dto/req/update-color.req';

@Injectable()
export class ColorService {
  constructor(
    @InjectRepository(Color)
    private readonly colorRepo: Repository<Color>,
  ) {}

  async create(dto: CreateColorReq): Promise<Color> {
    const color = this.colorRepo.create(dto);
    return this.colorRepo.save(color);
  }

  async findAll(): Promise<Color[]> {
    return await this.colorRepo.find();
  }

  async findOne(id: number): Promise<Color> {
    const color = await this.colorRepo.findOne({ where: { id } });
    if (!color) throw new NotFoundException(`ไม่พบสีที่มี ID = ${id}`);
    return color;
  }

  async update(id: number, dto: UpdateColorReq): Promise<Color> {
    const color = await this.findOne(id);
    Object.assign(color, dto);
    return this.colorRepo.save(color);
  }

  async remove(id: number): Promise<void> {
    const color = await this.findOne(id);
    await this.colorRepo.remove(color);
  }
}
