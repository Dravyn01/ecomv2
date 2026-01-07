import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Between, EntityManager, Repository, MoreThan, IsNull } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Image, ImageOwnerType } from './entities/image.entity';
import { CreateImageDTO } from './dto/create-image.dto';
import { UpdateImageDTO } from './dto/update-image.dto';
import { MoveImageDTO } from './dto/move-image.dto';

interface CreateImageRequest {
  image: CreateImageDTO;
  owner_id: string;
  owner_type: ImageOwnerType;
  tx?: EntityManager;
}

@Injectable()
export class ImageService {
  constructor(
    @InjectRepository(Image) private readonly imageRepo: Repository<Image>,
    private readonly manager: EntityManager,
  ) {}

  async findOne(image_id: string): Promise<Image> {
    const exists = await this.imageRepo.findOneBy({
      id: image_id,
    });

    if (!exists) throw new NotFoundException('not found image');
    return exists;
  }

  async createImage(req: CreateImageRequest): Promise<Image> {
    const repo = req.tx ? req.tx.getRepository(Image) : this.imageRepo;

    const lastImage = await repo.findOne({
      where: {
        owner_id: req.owner_id,
        owner_type: req.owner_type,
      },
      order: {
        order: 'DESC',
      },
      select: ['order'],
    });

    const nextOrder = lastImage && lastImage.order ? lastImage.order + 1 : 1;

    // CASE Profile
    if (lastImage && lastImage.owner_type === ImageOwnerType.PROFILE) {
      await repo.delete({
        owner_type: ImageOwnerType.PROFILE,
        owner_id: lastImage.owner_id,
      });
    }

    const image = repo.create({
      url: req.image.url,
      public_id: req.image.public_id,
      owner_type: req.owner_type,
      owner_id: req.owner_id,
      alt: req.image.alt,
      width: req.image.width,
      height: req.image.height,
      order: nextOrder,
      is_primary: req.image.is_primary,
    });

    return await repo.save(image);
  }

  async updateImage(dto: UpdateImageDTO, tx: EntityManager): Promise<void> {
    const image = await this.findOne(dto.image_id);

    await tx.update(
      Image,
      { id: image.id },
      {
        ...(dto.url && { url: image.url }),
        ...(dto.public_id && { public_id: image.public_id }),
        ...(dto.alt && { alt: image.alt }),
        ...(dto.width !== undefined && { width: image.width }),
        ...(dto.height !== undefined && { height: image.height }),
      },
    );
  }

  async updatePrimaryImage(image_id: string) {
    const image = await this.findOne(image_id);

    if (image.is_primary) return;

    await this.imageRepo.manager.transaction(async (tx) => {
      // แก้ primary ตัวเก่าให้เป็น false
      await tx.update(
        Image,
        {
          owner_id: image.owner_id,
          owner_type: image.owner_type,
          is_primary: true,
        },
        {
          is_primary: false,
        },
      );

      await tx.update(Image, image_id, { is_primary: true });
    });
  }

  async moveOrder(dto: MoveImageDTO) {
    const image = await this.findOne(dto.image_id);
    const maxOrder = await this.imageRepo.findOne({
      select: ['order'],
      where: {
        owner_id: image.owner_id,
        owner_type: image.owner_type,
        deleted_at: IsNull(),
      },
      order: {
        order: 'DESC',
      },
    });

    if (!maxOrder) {
      throw new NotFoundException('ไม่พบลำดับของรรูปภาพนี้');
    }

    if (dto.target < 1 || dto.target > maxOrder.order) {
      throw new BadRequestException('target order ไม่ถูกต้อง');
    }

    if (dto.target === image.order) return image;

    await this.manager.transaction(async (tx) => {
      if (dto.target < image.order) {
        // move up (ย้ายจาก order บนมาต่ำ)
        await tx.increment(
          Image,
          {
            owner_id: image.owner_id,
            owner_type: image.owner_type,
            order: Between(dto.target, image.order - 1), //
            deleted_at: IsNull(),
            /* target: 3, current: 5 (ลบ 1 เพื่อไม่ให้ 5 โดนขยับ) */
            /* Between(3, 5) -> 3, 4, 5 not correct */
            /* Between(3, 5 - 1) -> 3, 4 correct*/
            /* 1, 2, [3 + 1, 4 + 1] 5 */
            /* 1, 2, 4, 5, 5 มีช่องว่างเป็ฯ 3 */
            /* จากนั้น set current = target */
            /*  */
          },
          'order',
          1,
        );
      } else {
        // move down (ย้ายจาก order ต่ำมาบน)
        await tx.decrement(
          Image,
          {
            owner_id: image.owner_id,
            owner_type: image.owner_type,
            order: Between(image.order + 1, dto.target),
            deleted_at: IsNull(),
            /* target: 4, current: 1 (+1 เพื่อไม่ให้ 1 โดนขยับ) */
            /* Between(1, 4) -> 1, 2, 3, 4 not correct */
            /* Between(1 + 1, 4) -> 2, 3, 4 correct */
            /* 1 [2 - 1, 3 - 1, 4 - 1] 5 */
            /* 1, 1, 2, 3, 5 มีช่องว่างเป็ฯ 4 */
            /* จากนั้น set current = target */
          },
          'order',
          1,
        );
      }

      await tx.update(Image, image.id, {
        order: dto.target,
      });
    });
  }

  async deleteImage(image_id: string): Promise<Image> {
    const image = await this.findOne(image_id);

    return await this.manager.transaction(async (tx) => {
      await tx.softDelete(Image, image_id);

      if (image.is_primary) {
        // หารูปที่เก่าที่สุดหรือรูปแรกที่ยังไม่ถูกลบ
        const firstImage = await tx.findOne(Image, {
          where: {
            owner_id: image.owner_id,
            owner_type: image.owner_type,
            deleted_at: IsNull(),
          },
          order: {
            created_at: 'ASC',
          },
        });

        // ถ้าเจออัพเดทรูปนั้นให้เป็ฯ primary
        if (firstImage) {
          // ล้างตัวเก่า กัน edge case
          await tx.update(
            Image,
            {
              owner_id: image.owner_id,
              owner_type: image.owner_type,
              is_primary: true,
            },
            {
              is_primary: false,
            },
          );

          await tx.update(Image, firstImage.id, { is_primary: true });
        }
      }

      // ขะยับ order ให้ตัวที่อยู่หลังรูปที่จะลบ มัน -1
      await tx.decrement(
        Image,
        {
          owner_id: image.owner_id,
          owner_type: image.owner_type,
          order: MoreThan(image.order),
          deleted_at: IsNull(),
        },
        'order',
        1,
      );

      return image;
    });
  }
}
