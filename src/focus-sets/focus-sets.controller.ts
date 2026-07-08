import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
} from "@nestjs/common"
import { FocusSetsService } from "./focus-sets.service"
import { ConditionNode, FocusSetView, SkuView } from "./focus-set-types"

interface FocusSetBody {
  name: string
  filter: ConditionNode
}

@Controller("focus-sets")
export class FocusSetsController {
  constructor(private readonly service: FocusSetsService) {}

  @Get()
  list(): FocusSetView[] {
    return this.service.findAll()
  }

  @Post("resolve")
  @HttpCode(200)
  resolve(@Body() body: { filter: ConditionNode }): {
    count: number
    skus: SkuView[]
  } {
    return this.service.resolve(body.filter)
  }

  @Get(":id")
  get(@Param("id") id: string): FocusSetView {
    return this.service.findOne(id)
  }

  @Get(":id/skus")
  skus(@Param("id") id: string): { count: number; skus: SkuView[] } {
    return this.service.resolveById(id)
  }

  @Post()
  create(@Body() body: FocusSetBody): FocusSetView {
    return this.service.create(
      { name: body.name, filter: body.filter },
      new Date().toISOString(),
    )
  }

  @Put(":id")
  update(@Param("id") id: string, @Body() body: FocusSetBody): FocusSetView {
    return this.service.update(id, { name: body.name, filter: body.filter })
  }

  @Post(":id/duplicate")
  duplicate(
    @Param("id") id: string,
    @Body() body: { name: string },
  ): FocusSetView {
    return this.service.duplicate(id, body.name)
  }

  @Delete(":id")
  @HttpCode(204)
  remove(@Param("id") id: string): void {
    this.service.remove(id)
  }
}
