import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { DateQueryDTO } from './dto/date.query';
import { Roles } from 'src/common/decorators/role.decorator';
import { CheckRoleGuard } from 'src/common/guards/role.guard';
import { JwtGuard } from 'src/common/guards/jwt.guard';

@Controller('/dashboard/')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('/get-history')
  async getHistory() {
    const result = await this.analyticsService.getHistory();
    return { message: '', data: result };
  }

  @Get('/sales-summary')
  async getSalesSummary(@Query() query: DateQueryDTO) {
    const summary = await this.analyticsService.getSalesSummary(query);
    return { message: '', data: summary };
  }

  @Get('/orders-sumary-today')
  async getOrdersSummaryToday(@Query() query: DateQueryDTO) {
    const summary_orders =
      await this.analyticsService.getPaidOrderVsCancelOrder(query);
    return { message: '', data: summary_orders };
  }

  @UseGuards(JwtGuard, CheckRoleGuard)
  @Roles('admin')
  @Get('/get-new-user')
  async getNewUser(@Query() query: DateQueryDTO) {
    const result = await this.analyticsService.getNewUser(query);
    return { message: '', data: result };
  }
}
