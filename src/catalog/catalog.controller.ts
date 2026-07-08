import { Controller, Get } from "@nestjs/common"
import { CatalogService } from "./catalog.service"
import { AttributeOption } from "../focus-sets/focus-set-types"

@Controller("catalog")
export class CatalogController {
  constructor(private readonly service: CatalogService) {}

  @Get("attributes")
  attributes(): AttributeOption[] {
    return this.service.attributes()
  }
}
