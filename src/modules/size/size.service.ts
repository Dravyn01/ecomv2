import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Size } from './entities/size.entity';
import { CreateSizeReq } from './dto/req/create-size.req';
import { UpdateSizeReq } from './dto/req/update-size.req';

@Injectable()
export class SizeService {
  constructor(
    @InjectRepository(Size)
    private readonly sizeRepo: Repository<Size>,
  ) {}

  async create(dto: CreateSizeReq): Promise<Size> {
    const size = this.sizeRepo.create(dto);
    return this.sizeRepo.save(size);
  }

  async findAll(): Promise<Size[]> {
    return this.sizeRepo.find();
  }

  async findOne(id: number): Promise<Size> {
    const size = await this.sizeRepo.findOne({ where: { id } });
    if (!size) throw new NotFoundException(`Size with ID ${id} not found`);
    return size;
  }

  async update(id: number, dto: UpdateSizeReq): Promise<Size> {
    const size = await this.findOne(id);
    Object.assign(size, dto);
    return this.sizeRepo.save(size);
  }

  async remove(id: number): Promise<void> {
    const size = await this.findOne(id);
    await this.sizeRepo.remove(size);
  }
}
