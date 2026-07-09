import { Test } from "@nestjs/testing"
import { GuardrailsService } from "./guardrails.service"
import { NotFoundException } from "@nestjs/common"

describe("GuardrailsService", () => {
  let service: GuardrailsService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [GuardrailsService],
    }).compile()
    service = module.get(GuardrailsService)
  })

  it("findAll returns seed guardrails", () => {
    const all = service.findAll()
    expect(all.length).toBe(4)
    expect(all[0].brand).toBe("Gymboree")
  })

  it("create adds a new guardrail with active=true and isOverridable=true", () => {
    const g = service.create({
      brand: "TCP",
      division: "TODDLER GIRLS",
      rule: "Max Discount",
      op: "<=",
      value: "30",
      unit: "%",
    })
    expect(g.id).toBe(5)
    expect(g.active).toBe(true)
    expect(g.isOverridable).toBe(true)
    expect(service.findAll().length).toBe(5)
  })

  it("update changes value field", () => {
    const g = service.update(1, { value: "42" })
    expect(g.value).toBe("42")
    expect(service.findOne(1)?.value).toBe("42")
  })

  it("update throws NotFoundException for unknown id", () => {
    expect(() => service.update(999, { value: "1" })).toThrow(NotFoundException)
  })

  it("toggleActive flips active state", () => {
    expect(service.findOne(1)?.active).toBe(true)
    service.toggleActive(1)
    expect(service.findOne(1)?.active).toBe(false)
    service.toggleActive(1)
    expect(service.findOne(1)?.active).toBe(true)
  })

  it("toggleOverridable flips isOverridable state", () => {
    expect(service.findOne(2)?.isOverridable).toBe(false)
    service.toggleOverridable(2)
    expect(service.findOne(2)?.isOverridable).toBe(true)
  })

  it("remove deletes a guardrail", () => {
    service.remove(4)
    expect(service.findAll().length).toBe(3)
    expect(service.findOne(4)).toBeUndefined()
  })

  it("remove throws NotFoundException for unknown id", () => {
    expect(() => service.remove(999)).toThrow(NotFoundException)
  })

  it("evaluate returns passed=true when metrics satisfy threshold", () => {
    const result = service.evaluate({
      brand: "Gymboree",
      division: "BIG GIRLS",
      metrics: { "Gross Margin": 40 },
    })
    expect(result.compliant).toBe(true)
    expect(result.results[0].passed).toBe(true)
    expect(result.results[0].severity).toBe("advisory")
  })

  it("evaluate returns passed=false and severity=hard for non-overridable violation", () => {
    const result = service.evaluate({
      brand: "TCP",
      division: "BOYS",
      metrics: { "Min Price": 3.0 },
    })
    expect(result.compliant).toBe(false)
    expect(result.results[0].passed).toBe(false)
    expect(result.results[0].severity).toBe("hard")
    expect(result.results[0].isOverridable).toBe(false)
  })
})
