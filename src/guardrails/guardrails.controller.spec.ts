import { Test } from "@nestjs/testing"
import { GuardrailsController } from "./guardrails.controller"
import { GuardrailsService } from "./guardrails.service"
import { INestApplication } from "@nestjs/common"
import request from "supertest"

describe("GuardrailsController", () => {
  let app: INestApplication

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [GuardrailsController],
      providers: [GuardrailsService],
    }).compile()
    app = module.createNestApplication()
    await app.init()
  })

  afterEach(() => app.close())

  it("GET /guardrails returns 4 seed guardrails", async () => {
    const res = await request(app.getHttpServer()).get("/guardrails").expect(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBe(4)
  })

  it("POST /guardrails creates a guardrail", async () => {
    const res = await request(app.getHttpServer())
      .post("/guardrails")
      .send({ brand: "TCP", division: "GIRLS", rule: "Gross Margin", op: ">=", value: "35", unit: "%" })
      .expect(201)
    expect(res.body.id).toBe(5)
    expect(res.body.active).toBe(true)
  })

  it("PATCH /guardrails/:id updates value", async () => {
    const res = await request(app.getHttpServer())
      .patch("/guardrails/1")
      .send({ value: "42" })
      .expect(200)
    expect(res.body.value).toBe("42")
  })

  it("PATCH /guardrails/:id/active toggles active", async () => {
    const before = await request(app.getHttpServer()).get("/guardrails").expect(200)
    const originalActive = (before.body as { id: number; active: boolean }[]).find((g) => g.id === 1)?.active
    const res = await request(app.getHttpServer()).patch("/guardrails/1/active").expect(200)
    expect(res.body.active).toBe(!originalActive)
  })

  it("PATCH /guardrails/:id/overridable toggles isOverridable", async () => {
    const res = await request(app.getHttpServer()).patch("/guardrails/2/overridable").expect(200)
    expect(res.body.isOverridable).toBe(true)
  })

  it("DELETE /guardrails/:id removes guardrail", async () => {
    await request(app.getHttpServer()).delete("/guardrails/4").expect(204)
    const res = await request(app.getHttpServer()).get("/guardrails").expect(200)
    expect((res.body as { id: number }[]).find((g) => g.id === 4)).toBeUndefined()
  })

  it("POST /guardrails/evaluate returns compliance result", async () => {
    const res = await request(app.getHttpServer())
      .post("/guardrails/evaluate")
      .send({ brand: "TCP", division: "BOYS", metrics: { "Min Price": 3.0 } })
      .expect(200)
    expect(res.body.compliant).toBe(false)
    expect(res.body.results[0].severity).toBe("hard")
  })
})
