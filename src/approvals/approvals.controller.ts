import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post } from "@nestjs/common"
import { ApprovalsService } from "./approvals.service"
import type { DecisionDto } from "./approval-types"

@Controller("approvals")
export class ApprovalsController {
  constructor(private readonly service: ApprovalsService) {}

  @Get("queue")
  getQueue() {
    return this.service.getQueue()
  }

  @Get("decided")
  getDecided() {
    return this.service.getDecided()
  }

  @Get("scenarios/:id/review")
  getScenarioReview(@Param("id", ParseIntPipe) id: number) {
    return this.service.getScenarioReview(id)
  }

  @Get("discounts/:id/review")
  getDiscountReview(@Param("id", ParseIntPipe) id: number) {
    return this.service.getDiscountReview(id)
  }

  @Post("scenarios/:id/decision")
  @HttpCode(HttpStatus.OK)
  decideScenario(@Param("id", ParseIntPipe) id: number, @Body() dto: DecisionDto) {
    return this.service.decideScenario(id, dto)
  }

  @Post("discounts/:id/decision")
  @HttpCode(HttpStatus.OK)
  decideDiscount(@Param("id", ParseIntPipe) id: number, @Body() dto: DecisionDto) {
    return this.service.decideDiscount(id, dto)
  }
}
