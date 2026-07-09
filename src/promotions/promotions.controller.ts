import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from "@nestjs/common"
import { PromotionsService } from "./promotions.service"
import type {
  CreatePromotionDto,
  PromoProductsView,
  PromotionEntity,
  UpdatePromotionDto,
} from "./promotion-types"

@Controller("promotions")
export class PromotionsController {
  constructor(private readonly service: PromotionsService) {}

  @Get()
  findAll(): PromotionEntity[] {
    return this.service.findAll()
  }

  @Get(":id/products")
  getProducts(@Param("id", ParseIntPipe) id: number): PromoProductsView {
    return this.service.getProducts(id)
  }

  @Post()
  create(@Body() dto: CreatePromotionDto): PromotionEntity {
    return this.service.create(dto)
  }

  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdatePromotionDto,
  ): PromotionEntity {
    return this.service.update(id, dto)
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("id", ParseIntPipe) id: number): void {
    this.service.remove(id)
  }
}
