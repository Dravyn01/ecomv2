import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { UserModule } from '../user/user.module';
import { ImageModule } from '../image/image.module';

@Module({
  imports: [TypeOrmModule.forFeature([Review]), UserModule, ImageModule],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
