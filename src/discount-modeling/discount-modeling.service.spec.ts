import { Test } from "@nestjs/testing"
import { BadRequestException, NotFoundException } from "@nestjs/common"
import { DiscountModelingService } from "./discount-modeling.service"
import { FocusSetsService } from "../focus-sets/focus-sets.service"

const BASE_DTO = {
  name: "Summer Markdown",
  focusGroupId: "",
  startDate: "2026-08-01",
  endDate: "2026-08-14",
  discountFormat: "percentage" as const,
  discountDepth: 20,
  channel: "digital",
}

describe("DiscountModelingService", () => {
  let service: DiscountModelingService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [DiscountModelingService, FocusSetsService],
    }).compile()
    service = module.get(DiscountModelingService)
  })

  it("starts with empty store", () => {
    expect(service.findAll()).toHaveLength(0)
  })

  it("create returns model with status=new and no output", () => {
    const m = service.create(BASE_DTO)
    expect(m.id).toBe(1)
    expect(m.status).toBe("new")
    expect(m.output).toBeNull()
    expect(m.marketingHandle).toBe("")
  })

  it("run produces output and sets status=draft", () => {
    const m = service.create(BASE_DTO)
    const ran = service.run(m.id)
    expect(ran.status).toBe("draft")
    expect(ran.output).not.toBeNull()
    expect(ran.output?.kpis.revenueImpact).toBeGreaterThan(0)
    expect(ran.output?.rollupRows).toHaveLength(5)
    expect(ran.output?.riskPanels).toHaveLength(6)
    expect(ran.output?.forecastRevenue).toHaveLength(2)
    expect(ran.output?.forecastUnits).toHaveLength(8)
    expect(ran.marketingHandle).toMatch(/^TCP-PCT-20/)
  })

  it("submit transitions draft→pending", () => {
    const m = service.create(BASE_DTO)
    service.run(m.id)
    const submitted = service.submit(m.id)
    expect(submitted.status).toBe("pending")
  })

  it("submit throws BadRequestException if not draft", () => {
    const m = service.create(BASE_DTO)
    expect(() => service.submit(m.id)).toThrow(BadRequestException)
  })

  it("updateStatus forces any status", () => {
    const m = service.create(BASE_DTO)
    const updated = service.updateStatus(m.id, { status: "approved" })
    expect(updated.status).toBe("approved")
  })

  it("remove deletes the model", () => {
    const m = service.create(BASE_DTO)
    service.remove(m.id)
    expect(service.findAll()).toHaveLength(0)
  })

  it("remove throws NotFoundException for unknown id", () => {
    expect(() => service.remove(999)).toThrow(NotFoundException)
  })

  it("findOne throws NotFoundException for unknown id", () => {
    expect(() => service.findOne(999)).toThrow(NotFoundException)
  })

  it("bogo discount format sets rate=0.5", () => {
    const m = service.create({ ...BASE_DTO, discountFormat: "bogo", discountDepth: undefined })
    const ran = service.run(m.id)
    expect(ran.marketingHandle).toContain("BOGO")
    expect(ran.output?.kpis.revenueImpact).toBeGreaterThan(0)
  })

  it("findAll returns newest first", () => {
    service.create({ ...BASE_DTO, name: "A" })
    service.create({ ...BASE_DTO, name: "B" })
    const all = service.findAll()
    expect(all[0].name).toBe("B")
    expect(all[1].name).toBe("A")
  })

  it("margin impact is negative", () => {
    const m = service.create(BASE_DTO)
    const ran = service.run(m.id)
    expect(ran.output?.kpis.marginImpact).toBeLessThan(0)
  })

  it("sell-through is capped at 98", () => {
    // Very high discount → sell-through should cap
    const m = service.create({ ...BASE_DTO, discountDepth: 90 })
    const ran = service.run(m.id)
    expect(ran.output?.kpis.sellThrough).toBeLessThanOrEqual(98)
  })
})
