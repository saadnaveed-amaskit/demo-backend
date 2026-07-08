import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { FocusSetsController } from "./focus-sets.controller"
import { FocusSetsService } from "./focus-sets.service"
import { CatalogController } from "../catalog/catalog.controller"
import { CatalogService } from "../catalog/catalog.service"

describe("Focus Sets API (contract)", () => {
  let app: INestApplication

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [FocusSetsController, CatalogController],
      providers: [FocusSetsService, CatalogService],
    }).compile()
    app = moduleRef.createNestApplication()
    await app.init()
  })

  afterEach(async () => {
    await app.close()
  })

  it("GET /catalog/attributes returns dynamic attribute options", async () => {
    const res = await request(app.getHttpServer()).get("/catalog/attributes").expect(200)
    const brand = res.body.find((a: { attr: string }) => a.attr === "brand")
    expect(brand.values).toEqual(expect.arrayContaining(["TCP", "Gymboree"]))
  })

  it("POST /focus-sets/resolve resolves an unsaved filter for preview", async () => {
    const res = await request(app.getHttpServer())
      .post("/focus-sets/resolve")
      .send({ filter: { type: "group", logic: "AND", rules: [{ type: "rule", attr: "brand", val: "TCP" }] } })
      .expect(200)
    expect(res.body.count).toBeGreaterThan(0)
    expect(res.body.skus.every((s: { brand: string }) => s.brand === "TCP")).toBe(true)
  })

  it("rejects create without a name (400)", async () => {
    await request(app.getHttpServer())
      .post("/focus-sets")
      .send({ name: "", filter: { type: "group", logic: "AND", rules: [] } })
      .expect(400)
  })

  it("supports the full CRUD + duplicate + delete lifecycle", async () => {
    const server = app.getHttpServer()
    const created = await request(server)
      .post("/focus-sets")
      .send({ name: "Gym", filter: { type: "group", logic: "AND", rules: [{ type: "rule", attr: "brand", val: "Gymboree" }] } })
      .expect(201)
    expect(created.body.id).toMatch(/^focus-set-\d+$/)
    expect(created.body.productCount).toBeGreaterThan(0)

    const id = created.body.id
    await request(server).get("/focus-sets").expect(200).expect((r) => {
      expect(r.body.length).toBe(1)
    })

    await request(server)
      .put(`/focus-sets/${id}`)
      .send({ name: "Renamed", filter: { type: "group", logic: "AND", rules: [] } })
      .expect(200)
      .expect((r) => expect(r.body.name).toBe("Renamed"))

    const dup = await request(server)
      .post(`/focus-sets/${id}/duplicate`)
      .send({ name: "Copy" })
      .expect(201)
    expect(dup.body.id).not.toBe(id)

    await request(server).get(`/focus-sets/${id}/skus`).expect(200)
    await request(server).delete(`/focus-sets/${id}`).expect(204)
  })
})
