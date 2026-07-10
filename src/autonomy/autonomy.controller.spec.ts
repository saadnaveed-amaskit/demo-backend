import { Test } from "@nestjs/testing"
import { BadRequestException } from "@nestjs/common"
import { AutonomyController } from "./autonomy.controller"
import { AutonomyService } from "./autonomy.service"
import type { ActionClassEntity, AutonomyRosterView, KillSwitchState } from "./autonomy-types"

// Anticipated types/module for SLICE-11 (Pricing Autonomy) — not yet implemented.
// This test is written ahead of the implementation per acceptance-test-first;
// see knowledge/specs/001-platform-baseline/validation/SLICE-11-preparation.md.

const mockActionClass: ActionClassEntity = {
  id: 1,
  name: "Markdown Threshold Adjustment",
  trustRung: "Supervised",
  reversibilityClass: "Low",
  atReversibilityCeiling: true,
  sampleCount: 120,
  accuracy: 0.92,
  acceptanceRate: 0.88,
}

const mockRoster: AutonomyRosterView = {
  kpis: {
    totalActionClasses: 1,
    eligibleToPromote: 0,
    totalLiveDollarValue: 125000,
    averageProofAccuracy: 0.92,
  },
  actionClasses: [mockActionClass],
  killSwitchEngaged: false,
}

const mockService = {
  getRoster: jest.fn().mockReturnValue(mockRoster),
  promote: jest.fn().mockImplementation(() => {
    throw new BadRequestException("Blocked: action class is at its reversibility ceiling")
  }),
  demote: jest.fn().mockReturnValue({ ...mockActionClass, trustRung: "Manual" }),
  veto: jest.fn().mockReturnValue({ id: 1, status: "vetoed" }),
  undo: jest.fn().mockReturnValue({ id: 1, status: "undone" }),
  engageKillSwitch: jest.fn().mockReturnValue({ killSwitchEngaged: true } as KillSwitchState),
  disengageKillSwitch: jest.fn().mockReturnValue({ killSwitchEngaged: false } as KillSwitchState),
}

describe("AutonomyController", () => {
  let controller: AutonomyController

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [AutonomyController],
      providers: [{ provide: AutonomyService, useValue: mockService }],
    }).compile()
    controller = module.get(AutonomyController)
  })

  it("getRoster returns kpis and action classes", () => {
    const result = controller.getRoster()
    expect(result.actionClasses).toHaveLength(1)
    expect(result.killSwitchEngaged).toBe(false)
  })

  it("promote throws BadRequestException when the action class is at its reversibility ceiling", () => {
    expect(() => controller.promote(1)).toThrow(BadRequestException)
  })

  it("demote returns the action class with trustRung downgraded", () => {
    const result = controller.demote(1)
    expect(result.trustRung).toBe("Manual")
  })

  it("engageKillSwitch returns killSwitchEngaged true", () => {
    const result = controller.engageKillSwitch()
    expect(result.killSwitchEngaged).toBe(true)
  })

  it("disengageKillSwitch returns killSwitchEngaged false", () => {
    const result = controller.disengageKillSwitch()
    expect(result.killSwitchEngaged).toBe(false)
  })
})
