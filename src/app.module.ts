import { Module } from "@nestjs/common"
import { HealthController } from "./health/health.controller"
import { FocusSetsController } from "./focus-sets/focus-sets.controller"
import { FocusSetsService } from "./focus-sets/focus-sets.service"
import { CatalogController } from "./catalog/catalog.controller"
import { CatalogService } from "./catalog/catalog.service"
import { ProductGridController } from "./product-grid/product-grid.controller"
import { ProductGridService } from "./product-grid/product-grid.service"
import { GuardrailsController } from "./guardrails/guardrails.controller"
import { GuardrailsService } from "./guardrails/guardrails.service"

@Module({
  controllers: [HealthController, FocusSetsController, CatalogController, ProductGridController, GuardrailsController],
  providers: [FocusSetsService, CatalogService, ProductGridService, GuardrailsService],
})
export class AppModule {}
