import { Module } from "@nestjs/common"
import { HealthController } from "./health/health.controller"
import { FocusSetsController } from "./focus-sets/focus-sets.controller"
import { FocusSetsService } from "./focus-sets/focus-sets.service"
import { CatalogController } from "./catalog/catalog.controller"
import { CatalogService } from "./catalog/catalog.service"

@Module({
  controllers: [HealthController, FocusSetsController, CatalogController],
  providers: [FocusSetsService, CatalogService],
})
export class AppModule {}
