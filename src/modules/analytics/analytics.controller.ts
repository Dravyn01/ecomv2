import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('/dashboard/')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('/sales-summary')
  async getSalesSummary(@Query('from') from: string, @Query('to') to?: string) {
    const summary = await this.analyticsService.getSalesSummary(from, to);
    return { message: '', data: summary };
  }

  @Get('/orders-sumary-today')
  async getOrdersSummaryToday(
    @Query('from') from: string,
    @Query('to') to?: string,
  ) {
    const summary_orders =
      await this.analyticsService.getPaidOrderVsCancelOrder(from, to);
    return { message: '', data: summary_orders };
  }
}
