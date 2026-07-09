import { BadRequestException, NotFoundException } from "@nestjs/common"
import { Test } from "@nestjs/testing"
import { PriceScenariosService } from "./price-scenarios.service"
import { FocusSetsService } from "../focus-sets/focus-sets.service"
import { GuardrailsService } from "../guardrails/guardrails.service"

const mockFsService = {
  findOne: jest.fn().mockResolvedValue({ id: "fs1", name: "Test Set", productCount: 50 }),
}

const mockGuardrailsService = {
  findAll: jest.fn().mockReturnValue([
    {
      id: 1,
      brand: "TCP",
      division: "BOYS",
      rule: "Gross Margin",
      op: ">=",
      value: "38",
      unit: "%",
      active: true,
      isOverridable: true,
    },
  ]),
}

describe("PriceScenariosService", () => {
  let service: PriceScenariosService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PriceScenariosService,
        { provide: FocusSetsService, useValue: mockFsService },
        { provide: GuardrailsService, useValue: mockGuardrailsService },
      ],
    }).compile()
    service = module.get(PriceScenariosService)
    jest.clearAllMocks()
    mockFsService.findOne.mockResolvedValue({ id: "fs1", name: "Test Set", productCount: 50 })
    mockGuardrailsService.findAll.mockReturnValue([
      {
        id: 1,
        brand: "TCP",
        division: "BOYS",
        rule: "Gross Margin",
        op: ">=",
        value: "38",
        unit: "%",
        active: true,
        isOverridable: true,
      },
    ])
  })

  it("creates a scenario with status new", async () => {
    const s = await service.create({
      name: "Summer",
      focusGroupId: "fs1",
      startDate: "2026-08-01",
      endDate: "2026-09-30",
      objectives: { revenue: 50, grossMargin: 30, sellThrough: 20 },
      optimizationLevel: 50,
    })
    expect(s.status).toBe("new")
    expect(s.output).toBeNull()
    expect(s.skuCount).toBe(50)
  })

  it("run computes output and sets status to draft", async () => {
    const s = await service.create({
      name: "Test",
      focusGroupId: "fs1",
      startDate: "2026-08-01",
      endDate: "2026-09-30",
      objectives: { revenue: 50, grossMargin: 30, sellThrough: 20 },
      optimizationLevel: 40,
    })
    const ran = await service.run(s.id)
    expect(ran.status).toBe("draft")
    expect(ran.output).not.toBeNull()
    expect(ran.output!.frontier).toHaveLength(11)
    expect(ran.output!.comparison).toHaveLength(7)
    expect(ran.output!.recommendations.length).toBeGreaterThanOrEqual(4)
  })

  it("run computes scenarioPoint at current optimizationLevel", async () => {
    const s = await service.create({
      name: "Level Test",
      focusGroupId: "fs1",
      startDate: "2026-08-01",
      endDate: "2026-09-30",
      objectives: { revenue: 50, grossMargin: 30, sellThrough: 20 },
      optimizationLevel: 30,
    })
    const ran = await service.run(s.id)
    expect(ran.output!.scenarioPoint.level).toBe(30)
  })

  it("submit sets status to pending when draft", async () => {
    const s = await service.create({
      name: "X",
      focusGroupId: "fs1",
      startDate: "2026-08-01",
      endDate: "2026-09-30",
      objectives: { revenue: 50, grossMargin: 30, sellThrough: 20 },
      optimizationLevel: 50,
    })
    await service.run(s.id)
    const submitted = await service.submit(s.id)
    expect(submitted.status).toBe("pending")
  })

  it("submit throws 400 when status is not draft or returned", async () => {
    const s = await service.create({
      name: "Y",
      focusGroupId: "fs1",
      startDate: "2026-08-01",
      endDate: "2026-09-30",
      objectives: { revenue: 50, grossMargin: 30, sellThrough: 20 },
      optimizationLevel: 50,
    })
    await expect(service.submit(s.id)).rejects.toBeInstanceOf(BadRequestException)
  })

  it("submit allowed when returned (resubmit)", async () => {
    const s = await service.create({
      name: "Z",
      focusGroupId: "fs1",
      startDate: "2026-08-01",
      endDate: "2026-09-30",
      objectives: { revenue: 50, grossMargin: 30, sellThrough: 20 },
      optimizationLevel: 50,
    })
    await service.run(s.id)
    await service.submit(s.id)
    await service.updateStatus(s.id, { status: "returned", comment: "revise please" })
    const resubmitted = await service.submit(s.id)
    expect(resubmitted.status).toBe("pending")
  })

  it("updateStatus with comment appends to changeRequests when returning", async () => {
    const s = await service.create({
      name: "CR",
      focusGroupId: "fs1",
      startDate: "2026-08-01",
      endDate: "2026-09-30",
      objectives: { revenue: 50, grossMargin: 30, sellThrough: 20 },
      optimizationLevel: 50,
    })
    await service.run(s.id)
    await service.submit(s.id)
    const updated = await service.updateStatus(s.id, { status: "returned", comment: "fix it" })
    expect(updated.changeRequests).toHaveLength(1)
    expect(updated.changeRequests[0].comment).toBe("fix it")
  })

  it("remove deletes the scenario", async () => {
    const s = await service.create({
      name: "Del",
      focusGroupId: "fs1",
      startDate: "2026-08-01",
      endDate: "2026-09-30",
      objectives: { revenue: 50, grossMargin: 30, sellThrough: 20 },
      optimizationLevel: 50,
    })
    await service.remove(s.id)
    await expect(service.findOne(s.id)).rejects.toBeInstanceOf(NotFoundException)
  })

  it("findAll returns newest first", async () => {
    await service.create({
      name: "First",
      focusGroupId: "fs1",
      startDate: "2026-08-01",
      endDate: "2026-09-30",
      objectives: { revenue: 50, grossMargin: 30, sellThrough: 20 },
      optimizationLevel: 50,
    })
    await service.create({
      name: "Second",
      focusGroupId: "fs1",
      startDate: "2026-08-01",
      endDate: "2026-09-30",
      objectives: { revenue: 50, grossMargin: 30, sellThrough: 20 },
      optimizationLevel: 50,
    })
    const all = service.findAll()
    expect(all[0].name).toBe("Second")
  })

  it("findOne throws 404 for unknown id", async () => {
    await expect(service.findOne(9999)).rejects.toBeInstanceOf(NotFoundException)
  })

  it("run throws 404 for unknown id", async () => {
    await expect(service.run(9999)).rejects.toBeInstanceOf(NotFoundException)
  })

  it("output narrative includes uncertainty framing", async () => {
    const s = await service.create({
      name: "Narrative",
      focusGroupId: "fs1",
      startDate: "2026-08-01",
      endDate: "2026-09-30",
      objectives: { revenue: 50, grossMargin: 30, sellThrough: 20 },
      optimizationLevel: 50,
    })
    const ran = await service.run(s.id)
    expect(ran.output!.uncertainty).toContain("±")
  })

  it("getDeepDive returns priceAdjustments, marketingTiles, discountTiles", async () => {
    const s = await service.create({
      name: "DD",
      focusGroupId: "fs1",
      startDate: "2026-08-01",
      endDate: "2026-09-30",
      objectives: { revenue: 50, grossMargin: 30, sellThrough: 20 },
      optimizationLevel: 60,
    })
    await service.run(s.id)
    const dd = await service.getDeepDive(s.id)
    expect(dd.priceAdjustments.length).toBeGreaterThan(0)
    expect(dd.marketingTiles).toHaveLength(5)
    expect(dd.discountTiles).toHaveLength(5)
  })

  it("getDeepDive rows have unlockLevel in range 0–100", async () => {
    const s = await service.create({
      name: "DD2",
      focusGroupId: "fs1",
      startDate: "2026-08-01",
      endDate: "2026-09-30",
      objectives: { revenue: 50, grossMargin: 30, sellThrough: 20 },
      optimizationLevel: 80,
    })
    await service.run(s.id)
    const dd = await service.getDeepDive(s.id)
    dd.priceAdjustments.forEach((row) => {
      expect(row.unlockLevel).toBeGreaterThanOrEqual(0)
      expect(row.unlockLevel).toBeLessThanOrEqual(100)
    })
  })

  it("getDeepDive throws 404 when scenario has no output", async () => {
    const s = await service.create({
      name: "NoRun",
      focusGroupId: "fs1",
      startDate: "2026-08-01",
      endDate: "2026-09-30",
      objectives: { revenue: 50, grossMargin: 30, sellThrough: 20 },
      optimizationLevel: 50,
    })
    await expect(service.getDeepDive(s.id)).rejects.toBeInstanceOf(NotFoundException)
  })

  it("getDeepDive throws 404 for unknown id", async () => {
    await expect(service.getDeepDive(9999)).rejects.toBeInstanceOf(NotFoundException)
  })
})
