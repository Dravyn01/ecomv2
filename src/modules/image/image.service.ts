import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Image, ImageOwnerType } from './entities/image.entity';
import { CreateImageDTO } from './dto/create-image.dto';
import { UpdateImageDTO } from './dto/update-image.dto';

interface CreateImageRequest {
  image: CreateImageDTO;
  owner_id: number;
  owner_type: ImageOwnerType;
  tx: EntityManager;
}

interface UpdateImageRequest {
  image: UpdateImageDTO;
  tx: EntityManager;
}

@Injectable()
export class ImageService {
  constructor(
    @InjectRepository(Image) private readonly imageRepo: Repository<Image>,
  ) {}

  async findOne(image_id: string): Promise<Image> {
    const exists = await this.imageRepo.findOneBy({
      id: image_id,
    });

    if (!exists) throw new NotFoundException('not found image');
    return exists;
  }

  async createImage(req: CreateImageRequest): Promise<Image> {
    return await req.tx.save(Image, {
      url: req.image.url,
      public_id: req.image.public_id,
      owner_type: req.owner_type,
      owner_id: req.owner_id,
      order: req.image.order,
    });
  }

  async updateImage(req: UpdateImageRequest): Promise<Image> {
    const image = await this.findOne(req.image.image_id);

    if (req.image.url) {
      image.url = req.image.url;
    }

    if (req.image.public_id) {
      image.public_id = req.image.public_id;
    }

    if (req.image.order) {
      image.order = req.image.order;
    }

    await req.tx.update(Image, { id: req.image.image_id }, image);
    return image;
  }

  async deleteImage(image_id: string): Promise<void> {
    const deleteResult = await this.imageRepo.delete(image_id);
    if (deleteResult) {
      throw new ForbiddenException('เกิดข้อผิดพลาด ไม่มีการลบภาพเกิดขี้น');
    }
  }
}
