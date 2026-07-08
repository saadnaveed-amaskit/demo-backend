import { Injectable } from "@nestjs/common"
import { CATALOG_SKUS, FILTERABLE_ATTRIBUTES } from "./catalog-data"
import { AttributeOption } from "../focus-sets/focus-set-types"

@Injectable()
export class CatalogService {
  /** Distinct filterable attribute values derived dynamically from the catalog
   * (REQ-FOCUS-003 — attributes are not a hardcoded enum). */
  attributes(): AttributeOption[] {
    return FILTERABLE_ATTRIBUTES.map(({ attr, label }) => ({
      attr,
      label,
      values: [...new Set(CATALOG_SKUS.map((s) => String(s[attr])))].sort(),
    }))
  }
}
