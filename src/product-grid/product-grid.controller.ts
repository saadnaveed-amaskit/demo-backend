import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from "@nestjs/common"
import { ProductGridService } from "./product-grid.service"
import type { ProductGridView } from "./product-grid-types"

@Controller("product-grid")
export class ProductGridController {
  constructor(private readonly service: ProductGridService) {}

  @Get(":focusSetId")
  getGrid(@Param("focusSetId") focusSetId: string): ProductGridView {
    return this.service.getGrid(focusSetId)
  }

  @Post(":focusSetId/exclude")
  @HttpCode(HttpStatus.OK)
  excludeSku(
    @Param("focusSetId") focusSetId: string,
    @Body() body: { skuId: string },
  ): { excludedSkuId: string } {
    this.service.excludeSku(focusSetId, body.skuId)
    return { excludedSkuId: body.skuId }
  }

  @Delete(":focusSetId/exclusions/:skuId")
  @HttpCode(HttpStatus.NO_CONTENT)
  restoreSku(
    @Param("focusSetId") focusSetId: string,
    @Param("skuId") skuId: string,
  ): void {
    this.service.restoreSku(focusSetId, skuId)
  }

  @Delete(":focusSetId/exclusions")
  @HttpCode(HttpStatus.NO_CONTENT)
  restoreAll(@Param("focusSetId") focusSetId: string): void {
    this.service.restoreAll(focusSetId)
  }
}
