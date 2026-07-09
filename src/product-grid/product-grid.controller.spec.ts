import { Test } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { ProductGridController } from "./product-grid.controller"
import { ProductGridService } from "./product-grid.service"
import { FocusSetsService } from "../focus-sets/focus-sets.service"

describe("ProductGridController (HTTP contract)", () => {
  let app: INestApplication
  let focusSetsService: FocusSetsService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [ProductGridController],
      providers: [ProductGridService, FocusSetsService],
    }).compile()
    app = module.createNestApplication()
    await app.init()
    focusSetsService = module.get(FocusSetsService)
  })

  afterEach(() => app.close())

  it("GET /product-grid/:id returns 200 with grid view", async () => {
    const set = focusSetsService.create({ name: "Gymboree", filter: {
      type: "group",
      logic: "AND",
      rules: [{ type: "rule", attr: "brand", val: "Gymboree" }] } })
    const res = await request(app.getHttpServer())
      .get(`/product-grid/${set.id}`)
      .expect(200)
    expect(res.body.focusSetId).toBe(set.id)
    expect(Array.isArray(res.body.products)).toBe(true)
    expect(res.body.totalSkuCount).toBeGreaterThan(0)
  })

  it("GET /product-grid/:id returns 404 for unknown id", async () => {
    await request(app.getHttpServer()).get("/product-grid/no-such-id").expect(404)
  })

  it("POST /product-grid/:id/exclude marks a SKU excluded", async () => {
    const set = focusSetsService.create({ name: "Gymboree", filter: {
      type: "group",
      logic: "AND",
      rules: [{ type: "rule", attr: "brand", val: "Gymboree" }] } })
    await request(app.getHttpServer())
      .post(`/product-grid/${set.id}/exclude`)
      .send({ skuId: "GYM-BG-100" })
      .expect(200)
    const res = await request(app.getHttpServer()).get(`/product-grid/${set.id}`)
    const sku = res.body.products
      .flatMap((p: { skus: { sku: string; excluded: boolean }[] }) => p.skus)
      .find((s: { sku: string }) => s.sku === "GYM-BG-100")
    expect(sku.excluded).toBe(true)
  })

  it("DELETE /product-grid/:id/exclusions/:skuId restores a SKU", async () => {
    const set = focusSetsService.create({ name: "Gymboree", filter: {
      type: "group",
      logic: "AND",
      rules: [{ type: "rule", attr: "brand", val: "Gymboree" }] } })
    await request(app.getHttpServer())
      .post(`/product-grid/${set.id}/exclude`)
      .send({ skuId: "GYM-BG-100" })
    await request(app.getHttpServer())
      .delete(`/product-grid/${set.id}/exclusions/GYM-BG-100`)
      .expect(204)
    const res = await request(app.getHttpServer()).get(`/product-grid/${set.id}`)
    const sku = res.body.products
      .flatMap((p: { skus: { sku: string; excluded: boolean }[] }) => p.skus)
      .find((s: { sku: string }) => s.sku === "GYM-BG-100")
    expect(sku.excluded).toBe(false)
  })

  it("DELETE /product-grid/:id/exclusions restores all SKUs", async () => {
    const set = focusSetsService.create({ name: "Gymboree", filter: {
      type: "group",
      logic: "AND",
      rules: [{ type: "rule", attr: "brand", val: "Gymboree" }] } })
    await request(app.getHttpServer())
      .post(`/product-grid/${set.id}/exclude`)
      .send({ skuId: "GYM-BG-100" })
    await request(app.getHttpServer())
      .post(`/product-grid/${set.id}/exclude`)
      .send({ skuId: "GYM-BG-101" })
    await request(app.getHttpServer())
      .delete(`/product-grid/${set.id}/exclusions`)
      .expect(204)
    const res = await request(app.getHttpServer()).get(`/product-grid/${set.id}`)
    expect(res.body.activeSkuCount).toBe(res.body.totalSkuCount)
  })
})

