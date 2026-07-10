import { Test } from "@nestjs/testing"
import { BadRequestException } from "@nestjs/common"
import { MeasurementController } from "./measurement.controller"
import { MeasurementService } from "./measurement.service"
import type { ClusterView, ExperimentView } from "./measurement-types"

// Anticipated types/module for SLICE-12 (Measurement) — not yet implemented.
// This test is written ahead of the implementation per acceptance-test-first;
// see knowledge/specs/001-platform-baseline/validation/SLICE-12-preparation.md.

const mockImbalancedExperiment: ExperimentView = {
  id: 1,
  name: "Markdown Test — Girls Denim",
  status: "setup",
  costAcknowledged: false,
  createdAt: "2026-07-01T00:00:00.000Z",
  blocks: [
    { id: 1, label: "Block A", status: "Balanced", clusters: [] },
    { id: 2, label: "Block B", status: "Imbalanced", clusters: [] },
  ],
  goLiveEligible: false,
  goLiveBlockedReason: "1 block is imbalanced and the cost of control has not been acknowledged",
  readout: null,
}

const mockTreatmentCluster: ClusterView = {
  id: 10,
  blockId: 3,
  name: "Cluster 10",
  arm: "treatment",
  bauPrice: 29.99,
  mlPrice: 24.99,
  crossElasticity: 0.4,
  confidence: 0.82,
}

const mockBalancedExperiment: ExperimentView = {
  id: 2,
  name: "Promo Depth Test — Boys Outerwear",
  status: "setup",
  costAcknowledged: false,
  createdAt: "2026-07-02T00:00:00.000Z",
  blocks: [{ id: 3, label: "Block A", status: "Balanced", clusters: [mockTreatmentCluster] }],
  goLiveEligible: false,
  goLiveBlockedReason: "The cost of control has not been acknowledged",
  readout: null,
}

const mockLiveWinExperiment: ExperimentView = {
  id: 3,
  name: "Clearance Push — Footwear",
  status: "live",
  costAcknowledged: true,
  createdAt: "2026-06-20T00:00:00.000Z",
  blocks: [{ id: 4, label: "Block A", status: "Balanced", clusters: [] }],
  goLiveEligible: false,
  goLiveBlockedReason: null,
  readout: {
    probabilityOfWinning: 0.97,
    day: 14,
    verdict: "win",
    incrementalMargin: { estimate: 42000, lower: 28000, upper: 56000 },
    clusterContributions: [],
  },
}

const mockService = {
  listExperiments: jest.fn().mockReturnValue([mockImbalancedExperiment, mockBalancedExperiment, mockLiveWinExperiment]),
  getExperiment: jest.fn().mockImplementation((id: number) => {
    if (id === 1) return mockImbalancedExperiment
    if (id === 2) return mockBalancedExperiment
    return mockLiveWinExperiment
  }),
  moveCluster: jest.fn().mockReturnValue({ ...mockTreatmentCluster, arm: "control", mlPrice: null }),
  acknowledgeCost: jest.fn().mockReturnValue({ ...mockBalancedExperiment, costAcknowledged: true, goLiveEligible: true, goLiveBlockedReason: null }),
  goLive: jest.fn().mockImplementation(() => {
    throw new BadRequestException("Blocked: not all blocks are balanced and the cost of control has not been acknowledged")
  }),
  scale: jest.fn().mockReturnValue({ ...mockLiveWinExperiment, status: "concluded" }),
  kill: jest.fn().mockReturnValue({ ...mockLiveWinExperiment, status: "concluded" }),
}

describe("MeasurementController", () => {
  let controller: MeasurementController

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [MeasurementController],
      providers: [{ provide: MeasurementService, useValue: mockService }],
    }).compile()
    controller = module.get(MeasurementController)
  })

  it("listExperiments returns all seeded experiments", () => {
    const result = controller.listExperiments()
    expect(result).toHaveLength(3)
  })

  it("getExperiment returns an experiment with at least one imbalanced block and Go Live ineligible", () => {
    const result = controller.getExperiment(1)
    expect(result.blocks.some((b) => b.status === "Imbalanced")).toBe(true)
    expect(result.goLiveEligible).toBe(false)
  })

  it("moveCluster returns the cluster with arm=control and mlPrice=null", () => {
    const result = controller.moveCluster(2, 10, { arm: "control" })
    expect(result.arm).toBe("control")
    expect(result.mlPrice).toBeNull()
  })

  it("acknowledgeCost makes an all-balanced experiment Go-Live eligible", () => {
    const result = controller.acknowledgeCost(2)
    expect(result.costAcknowledged).toBe(true)
    expect(result.goLiveEligible).toBe(true)
  })

  it("goLive throws BadRequestException when not eligible", () => {
    expect(() => controller.goLive(1)).toThrow(BadRequestException)
  })

  it("getExperiment returns a live experiment with a 'win' verdict", () => {
    const result = controller.getExperiment(3)
    expect(result.status).toBe("live")
    expect(result.readout?.verdict).toBe("win")
  })

  it("scale concludes the experiment", () => {
    const result = controller.scale(3)
    expect(result.status).toBe("concluded")
  })
})
