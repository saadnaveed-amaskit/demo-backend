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
import { PromotionsController } from "./promotions/promotions.controller"
import { PromotionsService } from "./promotions/promotions.service"
import { DiscountModelingController } from "./discount-modeling/discount-modeling.controller"
import { DiscountModelingService } from "./discount-modeling/discount-modeling.service"
import { PriceScenariosController } from "./price-scenarios/price-scenarios.controller"
import { PriceScenariosService } from "./price-scenarios/price-scenarios.service"
import { ApprovalsController } from "./approvals/approvals.controller"
import { ApprovalsService } from "./approvals/approvals.service"
import { AgentsController } from "./agents/agents.controller"
import { AgentsService } from "./agents/agents.service"
import { AutonomyController } from "./autonomy/autonomy.controller"
import { AutonomyService } from "./autonomy/autonomy.service"
import { MeasurementController } from "./measurement/measurement.controller"
import { MeasurementService } from "./measurement/measurement.service"

@Module({
  controllers: [HealthController, FocusSetsController, CatalogController, ProductGridController, GuardrailsController, PromotionsController, DiscountModelingController, PriceScenariosController, ApprovalsController, AgentsController, AutonomyController, MeasurementController],
  providers: [FocusSetsService, CatalogService, ProductGridService, GuardrailsService, PromotionsService, DiscountModelingService, PriceScenariosService, ApprovalsService, AgentsService, AutonomyService, MeasurementService],
})
export class AppModule {}
