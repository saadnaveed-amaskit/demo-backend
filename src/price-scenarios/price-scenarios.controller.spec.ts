import { Test } from "@nestjs/testing"
import { PriceScenariosController } from "./price-scenarios.controller"
import { PriceScenariosService } from "./price-scenarios.service"
import type { ScenarioEntity } from "./price-scenario-types"

const mockScenario: ScenarioEntity = {
  id: 1,
  name: "Test Scenario",
  focusGroupId: "fs1",
  focusGroupName: "Test Set",
  skuCount: 50,
  startDate: "2026-08-01",
  endDate: "2026-09-30",
  objectives: { revenue: 50, grossMargin: 30, sellThrough: 20 },
  optimizationLevel: 50,
  status: "new",
  createdAt: "2026-07-09T00:00:00.000Z",
  changeRequests: [],
  output: null,
}

const mockDeepDive = {
  priceAdjustments: [{ sku: "SKU-1000", unlockLevel: 0 }],
  marketingTiles: [],
  discountTiles: [],
}

const mockService = {
  findAll: jest.fn().mockReturnValue([mockScenario]),
  findOne: jest.fn().mockResolvedValue(mockScenario),
  create: jest.fn().mockResolvedValue(mockScenario),
  run: jest.fn().mockResolvedValue({ ...mockScenario, status: "draft", output: {} }),
  submit: jest.fn().mockResolvedValue({ ...mockScenario, status: "pending" }),
  updateStatus: jest.fn().mockResolvedValue({ ...mockScenario, status: "approved" }),
  remove: jest.fn().mockResolvedValue(undefined),
  getDeepDive: jest.fn().mockResolvedValue(mockDeepDive),
}

describe("PriceScenariosController", () => {
  let controller: PriceScenariosController

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [PriceScenariosController],
      providers: [{ provide: PriceScenariosService, useValue: mockService }],
    }).compile()
    controller = module.get(PriceScenariosController)
  })

  it("findAll returns list", async () => {
    const result = controller.findAll()
    expect(result).toEqual([mockScenario])
  })

  it("findOne returns scenario by id", async () => {
    const result = await controller.findOne(1)
    expect(result.id).toBe(1)
  })

  it("create returns new scenario", async () => {
    const result = await controller.create({
      name: "Test Scenario",
      focusGroupId: "fs1",
      startDate: "2026-08-01",
      endDate: "2026-09-30",
      objectives: { revenue: 50, grossMargin: 30, sellThrough: 20 },
      optimizationLevel: 50,
    })
    expect(result.status).toBe("new")
  })

  it("run returns draft scenario with output", async () => {
    const result = await controller.run(1)
    expect(result.status).toBe("draft")
  })

  it("submit returns pending scenario", async () => {
    const result = await controller.submit(1)
    expect(result.status).toBe("pending")
  })

  it("updateStatus returns updated scenario", async () => {
    const result = await controller.updateStatus(1, { status: "approved" })
    expect(result.status).toBe("approved")
  })

  it("remove calls service", async () => {
    await controller.remove(1)
    expect(mockService.remove).toHaveBeenCalledWith(1)
  })

  it("findAll delegates to service", () => {
    controller.findAll()
    expect(mockService.findAll).toHaveBeenCalled()
  })

  it("getDeepDive returns deep dive output", async () => {
    const result = await controller.getDeepDive(1)
    expect(result.priceAdjustments).toBeDefined()
    expect(mockService.getDeepDive).toHaveBeenCalledWith(1)
  })
})
