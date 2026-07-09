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
import { DiscountModelingService } from "./discount-modeling.service"
import type { CreateDiscountModelDto, DiscountModelEntity, UpdateStatusDto } from "./discount-model-types"

@Controller("discount-models")
export class DiscountModelingController {
  constructor(private readonly service: DiscountModelingService) {}

  @Get()
  findAll(): DiscountModelEntity[] {
    return this.service.findAll()
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number): DiscountModelEntity {
    return this.service.findOne(id)
  }

  @Post()
  create(@Body() dto: CreateDiscountModelDto): DiscountModelEntity {
    return this.service.create(dto)
  }

  @Post(":id/run")
  @HttpCode(HttpStatus.OK)
  run(@Param("id", ParseIntPipe) id: number): DiscountModelEntity {
    return this.service.run(id)
  }

  @Post(":id/submit")
  @HttpCode(HttpStatus.OK)
  submit(@Param("id", ParseIntPipe) id: number): DiscountModelEntity {
    return this.service.submit(id)
  }

  @Patch(":id/status")
  @HttpCode(HttpStatus.OK)
  updateStatus(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateStatusDto,
  ): DiscountModelEntity {
    return this.service.updateStatus(id, dto)
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("id", ParseIntPipe) id: number): void {
    this.service.remove(id)
  }
}
