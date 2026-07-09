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
import { GuardrailsService } from "./guardrails.service"
import type {
  CreateGuardrailDto,
  EvaluateDto,
  GuardrailEntity,
  GuardrailEvaluationResult,
  UpdateGuardrailDto,
} from "./guardrail-types"

@Controller("guardrails")
export class GuardrailsController {
  constructor(private readonly service: GuardrailsService) {}

  @Get()
  findAll(): GuardrailEntity[] {
    return this.service.findAll()
  }

  @Post("evaluate")
  @HttpCode(HttpStatus.OK)
  evaluate(@Body() dto: EvaluateDto): GuardrailEvaluationResult {
    return this.service.evaluate(dto)
  }

  @Post()
  create(@Body() dto: CreateGuardrailDto): GuardrailEntity {
    return this.service.create(dto)
  }

  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateGuardrailDto,
  ): GuardrailEntity {
    return this.service.update(id, dto)
  }

  @Patch(":id/active")
  @HttpCode(HttpStatus.OK)
  toggleActive(@Param("id", ParseIntPipe) id: number): GuardrailEntity {
    return this.service.toggleActive(id)
  }

  @Patch(":id/overridable")
  @HttpCode(HttpStatus.OK)
  toggleOverridable(@Param("id", ParseIntPipe) id: number): GuardrailEntity {
    return this.service.toggleOverridable(id)
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("id", ParseIntPipe) id: number): void {
    this.service.remove(id)
  }
}
