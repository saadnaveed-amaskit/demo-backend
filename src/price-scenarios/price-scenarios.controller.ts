import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from "@nestjs/common"
import { PriceScenariosService } from "./price-scenarios.service"
import type { CreateScenarioDto, UpdateStatusDto } from "./price-scenario-types"

@Controller("price-scenarios")
export class PriceScenariosController {
  constructor(private readonly service: PriceScenariosService) {}

  @Get()
  findAll() {
    return this.service.findAll()
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.service.findOne(id)
  }

  @Post()
  create(@Body() dto: CreateScenarioDto) {
    return this.service.create(dto)
  }

  @Post(":id/run")
  @HttpCode(HttpStatus.OK)
  run(@Param("id", ParseIntPipe) id: number) {
    return this.service.run(id)
  }

  @Post(":id/submit")
  @HttpCode(HttpStatus.OK)
  submit(@Param("id", ParseIntPipe) id: number) {
    return this.service.submit(id)
  }

  @Patch(":id/status")
  @HttpCode(HttpStatus.OK)
  updateStatus(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateStatusDto) {
    return this.service.updateStatus(id, dto)
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.service.remove(id)
  }
}
