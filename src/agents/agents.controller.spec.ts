import { Test } from "@nestjs/testing"
import { BadRequestException, NotFoundException } from "@nestjs/common"
import { AgentsController } from "./agents.controller"
import { AgentsService } from "./agents.service"
import type { AgentCatalogView, AgentRosterView, MonitorEntity, TaskAgentEntity } from "./agent-types"

const mockMonitor: MonitorEntity = {
  id: 1,
  name: "Price Drift Monitor",
  type: "Price Drift Monitor",
  status: "active",
  signalsToday: 4,
  lastActivity: "2026-07-09T00:00:00.000Z",
  createdAt: "2026-07-01T00:00:00.000Z",
}

const mockTaskAgent: TaskAgentEntity = {
  id: 1,
  name: "Scenario Follow-up Agent",
  spawnedBy: "Price Scenario SC-104 approval",
  retirementCondition: "Scenario reaches Measurement verdict",
  status: "running",
  openLink: "/scenario",
  createdAt: "2026-07-05T00:00:00.000Z",
}

const mockRoster: AgentRosterView = {
  kpis: {
    agentsOnTeam: 6,
    signalsToday: 12,
    actingAutonomously: 2,
    evidenceBackedCount: 1,
    evidenceBackedTotal: 2,
    taskAgentsRunning: 1,
  },
  monitors: [mockMonitor],
  operators: [
    { id: 1, name: "Discount Approval Operator", type: "Discount Approval Operator", trustLevel: "Medium", evidenceStatus: "evidence-backed", trackRecord: "18/20 accurate over 90 days" },
  ],
  taskAgents: [mockTaskAgent],
}

const mockCatalog: AgentCatalogView = {
  monitorTypes: ["Price Drift Monitor", "Inventory Risk Monitor", "Competitor Price Monitor", "Guardrail Violation Monitor"],
  operatorTypes: ["Discount Approval Operator", "Scenario Optimization Operator"],
}

const mockService = {
  getRoster: jest.fn().mockReturnValue(mockRoster),
  getCatalog: jest.fn().mockReturnValue(mockCatalog),
  pauseMonitor: jest.fn().mockReturnValue({ ...mockMonitor, status: "paused" }),
  resumeMonitor: jest.fn().mockReturnValue({ ...mockMonitor, status: "active" }),
  hire: jest.fn().mockReturnValue(mockMonitor),
  retireTaskAgent: jest.fn().mockReturnValue({ ...mockTaskAgent, status: "retired" }),
}

describe("AgentsController", () => {
  let controller: AgentsController

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [AgentsController],
      providers: [{ provide: AgentsService, useValue: mockService }],
    }).compile()
    controller = module.get(AgentsController)
  })

  it("getRoster returns kpis, monitors, operators, and task agents", () => {
    const result = controller.getRoster()
    expect(result.kpis.agentsOnTeam).toBe(6)
    expect(result.monitors).toHaveLength(1)
    expect(result.operators).toHaveLength(1)
    expect(result.taskAgents).toHaveLength(1)
  })

  it("getCatalog returns provisionable monitor/operator types", () => {
    const result = controller.getCatalog()
    expect(result.monitorTypes).toContain("Price Drift Monitor")
    expect(result.operatorTypes).toContain("Discount Approval Operator")
  })

  it("pauseMonitor returns the monitor with status paused", () => {
    const result = controller.pauseMonitor(1)
    expect(result.status).toBe("paused")
    expect(mockService.pauseMonitor).toHaveBeenCalledWith(1)
  })

  it("resumeMonitor returns the monitor with status active", () => {
    const result = controller.resumeMonitor(1)
    expect(result.status).toBe("active")
    expect(mockService.resumeMonitor).toHaveBeenCalledWith(1)
  })

  it("hire delegates to service with the hire dto", () => {
    const result = controller.hire({ kind: "monitor", subtype: "Price Drift Monitor" })
    expect(result.name).toBe("Price Drift Monitor")
    expect(mockService.hire).toHaveBeenCalledWith({ kind: "monitor", subtype: "Price Drift Monitor" })
  })

  it("retireTaskAgent returns the task agent with status retired", () => {
    const result = controller.retireTaskAgent(1)
    expect(result.status).toBe("retired")
    expect(mockService.retireTaskAgent).toHaveBeenCalledWith(1)
  })
})

describe("AgentsService catalog validation", () => {
  it("throws BadRequestException when hiring a subtype not in the catalog", () => {
    const service = new AgentsService()
    expect(() => service.hire({ kind: "monitor", subtype: "Not A Real Type" })).toThrow(BadRequestException)
  })

  it("throws NotFoundException when pausing an unknown monitor id", () => {
    const service = new AgentsService()
    expect(() => service.pauseMonitor(9999)).toThrow(NotFoundException)
  })
})
