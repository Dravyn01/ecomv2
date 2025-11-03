import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { FindAllQuery } from 'src/common/dto/req/find-all.query';
import { ApiResponse } from 'src/common/dto/res/common-response';
import { Review } from './entities/review.entity';

@Controller('/admin/reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  // *DEBUG MODE*
  @Get()
  async findAll(): Promise<ApiResponse<Review[]>> {
    const reviews = await this.reviewService.findAll();
    return { message: '', data: reviews };
  }

  // *DEBUG MODE*
  // @Get(':user_id')
  // async findOneByUser(@Param('user_id') user_id: string) {
  //   return this.reviewService.findOne(+id);
  // }

  @Get(':product_id')
  async findOne(
    @Param('product_id') product_id: number,
    @Query() query: FindAllQuery,
  ): Promise<ApiResponse<Review[]>> {
    const reviews = await this.reviewService.findByProduct(+product_id, query);
    console.log(product_id);
    console.log(reviews);
    return { message: '', data: reviews };
  }

  @Post()
  async create(@Body() body: CreateReviewDto): Promise<ApiResponse<Review>> {
    const review = await this.reviewService.create(body);
    return { message: '', data: review };
  }

  @Delete(':review_id')
  async remove(@Param('review_id') id: string) {
    const review = await this.reviewService.delete(+id);
    return { message: '', data: review };
  }
}
