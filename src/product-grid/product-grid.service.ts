import { Injectable, NotFoundException } from "@nestjs/common"
import { FocusSetsService } from "../focus-sets/focus-sets.service"
import { CATALOG_SKUS } from "../catalog/catalog-data"
import { matchesSku } from "../focus-sets/condition"
import type { ProductGridView, ProductRow, SkuRow } from "./product-grid-types"

@Injectable()
export class ProductGridService {
  /** Per-focusSetId set of excluded SKU IDs (session-local; ORM/DB deferred). */
  private readonly exclusions = new Map<string, Set<string>>()

  constructor(private readonly focusSetsService: FocusSetsService) {}

  getGrid(focusSetId: string): ProductGridView {
    const set = this.focusSetsService.findOne(focusSetId)
    if (!set) throw new NotFoundException(`Focus set ${focusSetId} not found`)

    const excluded = this.exclusions.get(focusSetId) ?? new Set<string>()

    const matchedSkus = CATALOG_SKUS.filter((s) => matchesSku(s, set.filter))

    // Group by productId
    const productMap = new Map<string, SkuRow[]>()
    for (const s of matchedSkus) {
      const rows = productMap.get(s.productId) ?? []
      rows.push({
        sku: s.sku,
        productId: s.productId,
        productName: s.productName,
        name: s.name,
        brand: s.brand,
        division: s.division,
        category: s.category,
        subClass: s.subClass,
        msrp: s.msrp,
        price: s.price,
        qty: s.qty,
        onOrderQty: s.onOrderQty,
        status: s.status,
        excluded: excluded.has(s.sku),
      })
      productMap.set(s.productId, rows)
    }

    const products: ProductRow[] = []
    for (const [productId, skus] of productMap) {
      const activeSkus = skus.filter((s) => !s.excluded)
      const prices = skus.map((s) => s.price)
      const statuses = skus.map((s) => s.status)
      const worstStatus = statuses.includes("Out_of_stock")
        ? "Out_of_stock"
        : statuses.includes("Low_Stock")
          ? "Low_Stock"
          : "In_Stock"

      products.push({
        productId,
        productName: skus[0].productName,
        brand: skus[0].brand,
        division: skus[0].division,
        category: skus[0].category,
        skuCount: skus.length,
        activeSkuCount: activeSkus.length,
        priceRange: [Math.min(...prices), Math.max(...prices)],
        totalQty: skus.reduce((sum, s) => sum + s.qty, 0),
        stockStatus: worstStatus,
        skus,
      })
    }

    const totalSkuCount = matchedSkus.length
    const activeSkuCount = matchedSkus.filter((s) => !excluded.has(s.sku)).length

    return {
      focusSetId,
      focusSetName: set.name,
      filter: set.filter,
      products,
      totalSkuCount,
      activeSkuCount,
    }
  }

  excludeSku(focusSetId: string, skuId: string): void {
    const set = this.focusSetsService.findOne(focusSetId)
    if (!set) throw new NotFoundException(`Focus set ${focusSetId} not found`)
    const excluded = this.exclusions.get(focusSetId) ?? new Set<string>()
    excluded.add(skuId)
    this.exclusions.set(focusSetId, excluded)
  }

  restoreSku(focusSetId: string, skuId: string): void {
    this.exclusions.get(focusSetId)?.delete(skuId)
  }

  restoreAll(focusSetId: string): void {
    this.exclusions.delete(focusSetId)
  }
}
