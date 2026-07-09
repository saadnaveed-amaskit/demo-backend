import { Test } from "@nestjs/testing"
import { BadRequestException } from "@nestjs/common"
import { ApprovalsController } from "./approvals.controller"
import { ApprovalsService } from "./approvals.service"
import type { ApprovalItemView, ApprovalsQueueView } from "./approval-types"

const mockScenarioItem: ApprovalItemView = {
  domain: "scenario",
  id: 1,
  name: "Test Scenario",
  submitter: "J. Alvarez",
  team: "Pricing Team",
  brand: "TCP",
  division: "Girls",
  impact: "+12.3%",
  risk: "Medium",
  status: "pending",
  changeRequests: [],
}

const mockDiscountItem: ApprovalItemView = {
  domain: "discount",
  id: 1,
  name: "Test Model",
  submitter: "M. Chen",
  team: "Pricing Team",
  brand: "Gymboree",
  division: "Boys",
  impact: "+$45,000",
  risk: "High",
  status: "pending",
  changeRequests: [],
}

const mockQueue: ApprovalsQueueView = {
  scenarios: [mockScenarioItem],
  discounts: [mockDiscountItem],
  scenarioPendingCount: 1,
  discountPendingCount: 1,
}

const mockService = {
  getQueue: jest.fn().mockReturnValue(mockQueue),
  getDecided: jest.fn().mockReturnValue({ scenarios: [], discounts: [] }),
  getScenarioReview: jest.fn().mockResolvedValue({ ...mockScenarioItem, output: {} }),
  getDiscountReview: jest.fn().mockResolvedValue({
    ...mockDiscountItem,
    riskBanner: { hardCount: 1, advisoryCount: 2 },
    constraintWarnings: [],
    competitiveFlags: [],
  }),
  decideScenario: jest.fn().mockResolvedValue({ ...mockScenarioItem, status: "approved" }),
  decideDiscount: jest.fn().mockResolvedValue({ ...mockDiscountItem, status: "returned" }),
}

describe("ApprovalsController", () => {
  let controller: ApprovalsController

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [ApprovalsController],
      providers: [{ provide: ApprovalsService, useValue: mockService }],
    }).compile()
    controller = module.get(ApprovalsController)
  })

  it("getQueue returns pending scenarios and discounts with counts", () => {
    const result = controller.getQueue()
    expect(result.scenarioPendingCount).toBe(1)
    expect(result.discountPendingCount).toBe(1)
  })

  it("getDecided returns decided items", () => {
    const result = controller.getDecided()
    expect(result).toEqual({ scenarios: [], discounts: [] })
  })

  it("getScenarioReview delegates to service", async () => {
    const result = await controller.getScenarioReview(1)
    expect(mockService.getScenarioReview).toHaveBeenCalledWith(1)
    expect(result.output).toBeDefined()
  })

  it("getDiscountReview returns a risk banner with hard/advisory counts", async () => {
    const result = await controller.getDiscountReview(1)
    expect(result.riskBanner).toEqual({ hardCount: 1, advisoryCount: 2 })
  })

  it("decideScenario approves without requiring a comment", async () => {
    const result = await controller.decideScenario(1, { action: "approve" })
    expect(result.status).toBe("approved")
  })

  it("decideDiscount returns the item for changes when a comment is provided", async () => {
    const result = await controller.decideDiscount(1, { action: "request_changes", comment: "Re-check competitive pricing" })
    expect(result.status).toBe("returned")
    expect(mockService.decideDiscount).toHaveBeenCalledWith(1, { action: "request_changes", comment: "Re-check competitive pricing" })
  })
})

describe("ApprovalsService reason policy", () => {
  it("throws BadRequestException when deny is missing a comment", async () => {
    const { ApprovalsService: RealService } = await import("./approvals.service")
    const fakeScenarios = { findAll: () => [], updateStatus: jest.fn() } as unknown as import("../price-scenarios/price-scenarios.service").PriceScenariosService
    const fakeDiscounts = { findAll: () => [], updateStatus: jest.fn() } as unknown as import("../discount-modeling/discount-modeling.service").DiscountModelingService
    const service = new RealService(fakeScenarios, fakeDiscounts)
    await expect(service.decideScenario(1, { action: "deny" })).rejects.toThrow(BadRequestException)
  })

  it("throws BadRequestException when request_changes is missing a comment", async () => {
    const { ApprovalsService: RealService } = await import("./approvals.service")
    const fakeScenarios = { findAll: () => [], updateStatus: jest.fn() } as unknown as import("../price-scenarios/price-scenarios.service").PriceScenariosService
    const fakeDiscounts = { findAll: () => [], updateStatus: jest.fn() } as unknown as import("../discount-modeling/discount-modeling.service").DiscountModelingService
    const service = new RealService(fakeScenarios, fakeDiscounts)
    await expect(service.decideDiscount(1, { action: "request_changes" })).rejects.toThrow(BadRequestException)
  })
})
