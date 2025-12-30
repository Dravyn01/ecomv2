import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Between, EntityManager, Repository, MoreThan } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Image, ImageOwnerType } from './entities/image.entity';
import { CreateImageDTO } from './dto/create-image.dto';
import { UpdateImageDTO } from './dto/update-image.dto';
import { MoveImageDTO } from './dto/move-image.dto';

interface CreateImageRequest {
  image: CreateImageDTO;
  owner_id: string;
  owner_type: ImageOwnerType;
  tx: EntityManager;
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
    const image = await this.imageRepo.findOne({
      where: {
        owner_id: req.owner_id,
        owner_type: req.owner_type,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    let savedImage: Image;

    if (!image) {
      savedImage = {
        url: req.image.url,
        public_id: req.image.public_id,
        owner_type: req.owner_type,
        owner_id: req.owner_id,
        alt: req.image.alt,
        width: req.image.width,
        height: req.image.height,
      } as Image;
    } else {
      savedImage = {
        url: req.image.url,
        public_id: req.image.public_id,
        owner_type: req.owner_type,
        owner_id: req.owner_id,
        alt: req.image.alt,
        width: req.image.width,
        height: req.image.height,
        order: Math.max(image.order) + 1,
      } as Image;
    }

    req.tx.save(Image, savedImage);
    console.log('savedImage', savedImage);
    return savedImage;
  }

  async updateImage(dto: UpdateImageDTO, tx: EntityManager): Promise<void> {
    const image = await this.findOne(dto.image_id);

    await tx.update(
      Image,
      { id: dto.image_id },
      {
        ...(dto.url && { url: image.url }),
        ...(dto.public_id && { public_id: image.public_id }),
        ...(dto.alt && { alt: image.alt }),
        ...(dto.width && { width: image.width }),
        ...(dto.height && { height: image.height }),
      },
    );
  }

  async moveOrder(dto: MoveImageDTO) {
    const image = await this.findOne(dto.image_id);
    const maxOrder = await this.imageRepo.maximum('order', {
      owner_id: image.owner_id,
      owner_type: image.owner_type,
    });

    if (!maxOrder) {
      throw new NotFoundException('ไม่พบลำดับของรรูปภาพนี้');
    }

    if (dto.target < 1 || dto.target > maxOrder) {
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

  async deleteImage(
    image_id: string,
    owner_type: ImageOwnerType,
  ): Promise<void> {
    const image = await this.findOne(image_id);

    await this.manager.transaction(async (tx) => {
      await tx.softDelete(Image, { id: image_id, owner_type });

      await tx.decrement(
        Image,
        {
          id: image.id,
          owner_id: image.owner_id,
          owner_type: image.owner_type,
          order: MoreThan(image.order),
        },
        'order',
        1,
      );
    });
  }

  // async moveOrder(dto: MoveImageDTO): Promise<Image> {
  //   const image = await this.findOne(dto.image_id);
  //   const maxOrder = await this.maxOrder(
  //     image.owner_id,
  //     image.owner_type,
  //   );
  //
  //   let updatedResult: UpdateResult;
  //
  //   if (dto.target < 1 || dto.target > maxOrder) {
  //     throw new BadRequestException('target order ไม่ถูกต้อง');
  //   }
  //
  //   if (dto.target === image.order) {
  //     return image;
  //   }
  //
  //   await this.manager.transaction(async (tx) => {
  //     // move up (ย้ายจาก order บนมาต่ำ)
  //     if (dto.target < image.order) {
  //       /*
  //        * orders = [1,2,3,4,5]
  //        * target = 2
  //        * current = 5
  //        *
  //        * WHERE order >= 2 AND order < 5
  //        * result [2, 3, 4] จากนั้นเอาค่ามาบวก 1 ทั้งหมด
  //        * in orders [1, 3, 4, 5, 5] (ยังไม่สนใจว่ามี 5 ซ้ำ — ชั่วคราว)
  //        * set order 5 = 2
  //        * */
  //       updatedResult = await tx
  //         .createQueryBuilder()
  //         .update(Image)
  //         .set({ order: () => `"order" + 1` })
  //         .where(
  //           `
  //         "owner_id" = :owner_id AND
  //         "owner_type" = :owner_type AND
  //         "order" >= :target AND
  //         "order" < :current
  //         `,
  //           {
  //             owner_id: image.owner_id,
  //             owner_type: image.owner_type,
  //             current: image.order,
  //             target: dto.target,
  //           },
  //         )
  //         .execute();
  //     } else if (dto.target > image.order) {
  //       /*
  //        * move down (ย้ายจาก order ต่ำมาบน)
  //        *
  //        * orders = [1,2,3,4,5]
  //        * target = 5
  //        * current = 2
  //        *
  //        * WHERE order > 2 AND order <= 5
  //        * result [3, 4, 5] จากนั้นเอาค่ามาลบ 1 ทั้งหมด
  //        * in orders [1, 2, 2, 3, 4] (ยังไม่สนใจว่ามี 5 ซ้ำ — ชั่วคราว)
  //        * set order 2 = 5
  //        * */
  //       updatedResult = await tx
  //         .createQueryBuilder()
  //         .update(Image)
  //         .set({ order: () => `"order" - 1` })
  //         .where(
  //           `
  //         "owner_id" = :owner_id AND
  //         "owner_type" = :owner_type AND
  //         "order" > :current AND "order" <= :target
  //         `,
  //           {
  //             owner_id: image.owner_id,
  //             owner_type: image.owner_type,
  //             current: image.order,
  //             target: dto.target,
  //           },
  //         )
  //         .execute();
  //     }
  //
  //     await tx.update(Image, { id: dto.image_id }, { order: dto.target });
  //   });
  //
  //   return image;
  // }
}
