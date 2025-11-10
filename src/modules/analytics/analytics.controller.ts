import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ApiResponse } from 'src/common/dto/res/common-response';
import { UserPurchaseHistory } from './entities/user-purchase-history.entity';

@Controller('/dashboard/user-purchase-historys')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  async findAll(): Promise<ApiResponse<UserPurchaseHistory[]>> {
    const purachsers = await this.analyticsService.showPurchaseHistory();
    return { message: '', data: purachsers };
  }

  @Post()
  create(@Body() createAnalyticsDto: any) {
    return this.analyticsService.create(createAnalyticsDto);
  }

  @Get(':id')
  async getSummaryWithProductId(@Param('id') id: string) {
    const theDay = await this.analyticsService.getSalesSummary(+id);
    return { message: '', data: theDay };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAnalyticsDto: any) {
    return this.analyticsService.update(+id, updateAnalyticsDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.analyticsService.remove(+id);
  }
}
