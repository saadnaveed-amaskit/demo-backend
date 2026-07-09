import { Test } from "@nestjs/testing"
import { ProductGridService } from "./product-grid.service"
import { FocusSetsService } from "../focus-sets/focus-sets.service"

describe("ProductGridService", () => {
  let service: ProductGridService
  let focusSetsService: FocusSetsService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ProductGridService, FocusSetsService],
    }).compile()
    service = module.get(ProductGridService)
    focusSetsService = module.get(FocusSetsService)
  })

  it("returns a grid view grouped by productId for a Focus Set", async () => {
    const set = focusSetsService.create({ name: "Gymboree", filter: {
      type: "group",
      logic: "AND",
      rules: [{ type: "rule", attr: "brand", val: "Gymboree" }] } })
    const grid = service.getGrid(set.id)
    expect(grid.focusSetId).toBe(set.id)
    expect(grid.totalSkuCount).toBeGreaterThan(0)
    // P-GYM-BG-001 has 2 SKUs â†’ appears as one product row
    const legging = grid.products.find((p) => p.productId === "P-GYM-BG-001")
    expect(legging).toBeDefined()
    expect(legging!.skuCount).toBe(2)
  })

  it("throws 404 for an unknown focus set id", () => {
    expect(() => service.getGrid("no-such-id")).toThrow()
  })

  it("excludeSku marks a SKU as excluded and decrements activeSkuCount", () => {
    const set = focusSetsService.create({ name: "Gymboree", filter: {
      type: "group",
      logic: "AND",
      rules: [{ type: "rule", attr: "brand", val: "Gymboree" }] } })
    service.excludeSku(set.id, "GYM-BG-100")
    const grid = service.getGrid(set.id)
    const sku = grid.products
      .flatMap((p) => p.skus)
      .find((s) => s.sku === "GYM-BG-100")
    expect(sku!.excluded).toBe(true)
    expect(grid.activeSkuCount).toBe(grid.totalSkuCount - 1)
  })

  it("restoreSku un-excludes a SKU", () => {
    const set = focusSetsService.create({ name: "Gymboree", filter: {
      type: "group",
      logic: "AND",
      rules: [{ type: "rule", attr: "brand", val: "Gymboree" }] } })
    service.excludeSku(set.id, "GYM-BG-100")
    service.restoreSku(set.id, "GYM-BG-100")
    const grid = service.getGrid(set.id)
    const sku = grid.products
      .flatMap((p) => p.skus)
      .find((s) => s.sku === "GYM-BG-100")
    expect(sku!.excluded).toBe(false)
    expect(grid.activeSkuCount).toBe(grid.totalSkuCount)
  })

  it("restoreAll clears all exclusions", () => {
    const set = focusSetsService.create({ name: "Gymboree", filter: {
      type: "group",
      logic: "AND",
      rules: [{ type: "rule", attr: "brand", val: "Gymboree" }] } })
    service.excludeSku(set.id, "GYM-BG-100")
    service.excludeSku(set.id, "GYM-BG-101")
    service.restoreAll(set.id)
    const grid = service.getGrid(set.id)
    expect(grid.activeSkuCount).toBe(grid.totalSkuCount)
  })

  it("productRow.activeSkuCount reflects per-product exclusions", () => {
    const set = focusSetsService.create({ name: "Gymboree", filter: {
      type: "group",
      logic: "AND",
      rules: [{ type: "rule", attr: "brand", val: "Gymboree" }] } })
    service.excludeSku(set.id, "GYM-BG-100")
    const grid = service.getGrid(set.id)
    const legging = grid.products.find((p) => p.productId === "P-GYM-BG-001")!
    expect(legging.activeSkuCount).toBe(legging.skuCount - 1)
  })
})

