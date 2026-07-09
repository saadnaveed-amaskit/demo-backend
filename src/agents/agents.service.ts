import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common"
import type {
  AgentCatalogView,
  AgentKpis,
  AgentRosterView,
  HireDto,
  MonitorEntity,
  OperatorView,
  TaskAgentEntity,
} from "./agent-types"

const MONITOR_TYPES = [
  "Price Drift Monitor",
  "Inventory Risk Monitor",
  "Competitor Price Monitor",
  "Guardrail Violation Monitor",
]

const OPERATOR_TYPES = ["Discount Approval Operator", "Scenario Optimization Operator"]

const MONITOR_SEED: MonitorEntity[] = [
  {
    id: 1,
    name: "Price Drift Monitor",
    type: "Price Drift Monitor",
    status: "active",
    signalsToday: 4,
    lastActivity: "2026-07-09T08:00:00.000Z",
    createdAt: "2026-06-01T00:00:00.000Z",
  },
  {
    id: 2,
    name: "Inventory Risk Monitor",
    type: "Inventory Risk Monitor",
    status: "active",
    signalsToday: 2,
    lastActivity: "2026-07-09T07:30:00.000Z",
    createdAt: "2026-06-01T00:00:00.000Z",
  },
  {
    id: 3,
    name: "Competitor Price Monitor",
    type: "Competitor Price Monitor",
    status: "paused",
    signalsToday: 0,
    lastActivity: "2026-07-07T00:00:00.000Z",
    createdAt: "2026-06-01T00:00:00.000Z",
  },
]

const OPERATOR_SEED: OperatorView[] = [
  {
    id: 1,
    name: "Discount Approval Operator",
    type: "Discount Approval Operator",
    trustLevel: "Medium",
    evidenceStatus: "evidence-backed",
    trackRecord: "18/20 accurate over 90 days",
  },
  {
    id: 2,
    name: "Scenario Optimization Operator",
    type: "Scenario Optimization Operator",
    trustLevel: "Low",
    evidenceStatus: "unproven",
    trackRecord: "3/5 accurate over 14 days",
  },
]

const TASK_AGENT_SEED: TaskAgentEntity[] = [
  {
    id: 1,
    name: "Scenario Follow-up Agent",
    spawnedBy: "Price Scenario SC-104 approval",
    retirementCondition: "Scenario reaches Measurement verdict",
    status: "running",
    openLink: "/scenario",
    createdAt: "2026-07-05T00:00:00.000Z",
  },
  {
    id: 2,
    name: "Discount Rollout Agent",
    spawnedBy: "Discount Model approval",
    retirementCondition: "Discount window ends",
    status: "retired",
    openLink: "/discount-modeling",
    createdAt: "2026-06-20T00:00:00.000Z",
  },
]

@Injectable()
export class AgentsService {
  private monitors: MonitorEntity[] = MONITOR_SEED.map((m) => ({ ...m }))
  private operators: OperatorView[] = OPERATOR_SEED.map((o) => ({ ...o }))
  private taskAgents: TaskAgentEntity[] = TASK_AGENT_SEED.map((t) => ({ ...t }))
  private nextMonitorId = MONITOR_SEED.length + 1
  private nextOperatorId = OPERATOR_SEED.length + 1

  private buildKpis(): AgentKpis {
    return {
      agentsOnTeam: this.monitors.length + this.operators.length,
      signalsToday: this.monitors.reduce((sum, m) => sum + m.signalsToday, 0),
      actingAutonomously: this.operators.length,
      evidenceBackedCount: this.operators.filter((o) => o.evidenceStatus === "evidence-backed").length,
      evidenceBackedTotal: this.operators.length,
      taskAgentsRunning: this.taskAgents.filter((t) => t.status === "running").length,
    }
  }

  getRoster(): AgentRosterView {
    return {
      kpis: this.buildKpis(),
      monitors: [...this.monitors],
      operators: [...this.operators],
      taskAgents: [...this.taskAgents],
    }
  }

  getCatalog(): AgentCatalogView {
    return { monitorTypes: [...MONITOR_TYPES], operatorTypes: [...OPERATOR_TYPES] }
  }

  private findMonitor(id: number): MonitorEntity {
    const m = this.monitors.find((x) => x.id === id)
    if (!m) throw new NotFoundException(`Monitor ${id} not found`)
    return m
  }

  pauseMonitor(id: number): MonitorEntity {
    const m = this.findMonitor(id)
    m.status = "paused"
    m.lastActivity = new Date().toISOString()
    return m
  }

  resumeMonitor(id: number): MonitorEntity {
    const m = this.findMonitor(id)
    m.status = "active"
    m.lastActivity = new Date().toISOString()
    return m
  }

  hire(dto: HireDto): MonitorEntity | OperatorView {
    if (dto.kind === "monitor") {
      if (!MONITOR_TYPES.includes(dto.subtype)) {
        throw new BadRequestException(`"${dto.subtype}" is not a provisionable monitor type`)
      }
      const monitor: MonitorEntity = {
        id: this.nextMonitorId++,
        name: dto.subtype,
        type: dto.subtype,
        status: "active",
        signalsToday: 0,
        lastActivity: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      }
      this.monitors.push(monitor)
      return monitor
    }

    if (!OPERATOR_TYPES.includes(dto.subtype)) {
      throw new BadRequestException(`"${dto.subtype}" is not a provisionable operator type`)
    }
    const operator: OperatorView = {
      id: this.nextOperatorId++,
      name: dto.subtype,
      type: dto.subtype,
      trustLevel: "Low",
      evidenceStatus: "unproven",
      trackRecord: "No track record yet",
    }
    this.operators.push(operator)
    return operator
  }

  retireTaskAgent(id: number): TaskAgentEntity {
    const t = this.taskAgents.find((x) => x.id === id)
    if (!t) throw new NotFoundException(`Task agent ${id} not found`)
    t.status = "retired"
    return t
  }
}
