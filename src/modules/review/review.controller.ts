import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  Res,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDTO } from './dto/create-review.dto';
import { FindAllQuery } from 'src/common/dto/req/find-all.query';
import { ApiResponse } from 'src/common/dto/res/common-response';
import { Review } from './entities/review.entity';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { JwtPayload } from 'src/common/strategies/jwt.strategy';

@UseGuards(JwtGuard)
@Controller('/api/reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  // *DEBUG MODE*
  @Get()
  async findAll(): Promise<ApiResponse<Review[]>> {
    const reviews = await this.reviewService.findAll();
    return { message: '', data: reviews };
  }

  @Get(':product_id')
  async findOne(
    @Param('product_id') product_id: string,
    @Query() query: FindAllQuery,
  ): Promise<ApiResponse<Review[]>> {
    const reviews = await this.reviewService.findByProduct(product_id, query);
    console.log(product_id);
    console.log(reviews);
    return {
      message: `พบรีวิวของสินค้าหมายเลข ${product_id} ทั้งหมด ${reviews.length} รายการ`,
      data: reviews,
    };
  }

  @Post()
  async create(
    @Res() res: { user: JwtPayload },
    @Body() body: CreateReviewDTO,
  ): Promise<ApiResponse<Review>> {
    const review = await this.reviewService.create(res.user.sub, body);
    return { message: 'สร้างรีวิวเรียบร้อย', data: review };
  }

  @Delete(':review_id')
  async remove(@Param('review_id') review_id: string) {
    const review = await this.reviewService.delete(review_id);
    return { message: 'ลบรีวิวเรียบร้อย', data: review };
  }
}
