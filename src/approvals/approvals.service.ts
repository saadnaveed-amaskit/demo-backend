import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common"
import { PriceScenariosService } from "../price-scenarios/price-scenarios.service"
import type { ChangeRequest, ScenarioEntity } from "../price-scenarios/price-scenario-types"
import { DiscountModelingService } from "../discount-modeling/discount-modeling.service"
import type { DiscountModelEntity, RiskPanel } from "../discount-modeling/discount-model-types"
import type {
  ApprovalDecisionAction,
  ApprovalItemView,
  ApprovalRisk,
  ApprovalsDecidedView,
  ApprovalsQueueView,
  DecisionDto,
  DiscountReviewView,
  ScenarioReviewView,
} from "./approval-types"

interface DecisionRecord {
  domain: "scenario" | "discount"
  itemId: number
  action: ApprovalDecisionAction
  comment: string
  decidedAt: string
}

const SUBMITTER_ROSTER: Array<{ submitter: string; team: string; brand: string; division: string }> = [
  { submitter: "J. Alvarez", team: "Pricing Team", brand: "TCP", division: "Girls" },
  { submitter: "M. Chen", team: "Pricing Team", brand: "Gymboree", division: "Boys" },
  { submitter: "R. Patel", team: "Pricing Team", brand: "Both", division: "Baby" },
]

function placeholderSubmission(id: number) {
  return SUBMITTER_ROSTER[id % SUBMITTER_ROSTER.length]
}

function mapActionToStatus(action: ApprovalDecisionAction): "approved" | "denied" | "returned" {
  if (action === "approve") return "approved"
  if (action === "deny") return "denied"
  return "returned"
}

function discountRisk(riskPanels: RiskPanel[]): ApprovalRisk {
  if (riskPanels.some((p) => p.isHard)) return "High"
  if (riskPanels.length > 0) return "Medium"
  return "Low"
}

function scenarioRisk(scenario: ScenarioEntity): ApprovalRisk {
  const row = scenario.output?.comparison.find((r) => r.metric === "Inventory Risk")
  const value = row?.scenario
  if (value === "High" || value === "Medium" || value === "Low") return value
  return "Low"
}

function scenarioImpact(scenario: ScenarioEntity): string {
  const row = scenario.output?.comparison.find((r) => r.metric === "Rev Uplift")
  return row?.scenario ?? "n/a"
}

function discountImpact(model: DiscountModelEntity): string {
  const value = model.output?.kpis.revenueImpact ?? 0
  return `${value >= 0 ? "+" : ""}$${Math.round(value).toLocaleString()}`
}

const DECIDED_STATUSES = new Set(["approved", "denied", "returned"])

@Injectable()
export class ApprovalsService {
  private decisions: DecisionRecord[] = []

  constructor(
    private readonly scenariosService: PriceScenariosService,
    private readonly discountsService: DiscountModelingService,
  ) {}

  private discountChangeRequests(id: number): ChangeRequest[] {
    return this.decisions
      .filter((d) => d.domain === "discount" && d.itemId === id && d.action === "request_changes")
      .map((d) => ({ requestedAt: d.decidedAt, comment: d.comment }))
  }

  private toScenarioView(scenario: ScenarioEntity): ApprovalItemView {
    const placeholder = placeholderSubmission(scenario.id)
    return {
      domain: "scenario",
      id: scenario.id,
      name: scenario.name,
      ...placeholder,
      impact: scenarioImpact(scenario),
      risk: scenarioRisk(scenario),
      status: scenario.status as ApprovalItemView["status"],
      changeRequests: scenario.changeRequests,
    }
  }

  private toDiscountView(model: DiscountModelEntity): ApprovalItemView {
    const placeholder = placeholderSubmission(model.id)
    return {
      domain: "discount",
      id: model.id,
      name: model.name,
      ...placeholder,
      impact: discountImpact(model),
      risk: discountRisk(model.output?.riskPanels ?? []),
      status: model.status as ApprovalItemView["status"],
      changeRequests: this.discountChangeRequests(model.id),
    }
  }

  getQueue(): ApprovalsQueueView {
    const scenarios = this.scenariosService
      .findAll()
      .filter((s) => s.status === "pending")
      .map((s) => this.toScenarioView(s))
    const discounts = this.discountsService
      .findAll()
      .filter((m) => m.status === "pending")
      .map((m) => this.toDiscountView(m))
    return {
      scenarios,
      discounts,
      scenarioPendingCount: scenarios.length,
      discountPendingCount: discounts.length,
    }
  }

  getDecided(): ApprovalsDecidedView {
    const scenarios = this.scenariosService
      .findAll()
      .filter((s) => DECIDED_STATUSES.has(s.status))
      .map((s) => this.toScenarioView(s))
    const discounts = this.discountsService
      .findAll()
      .filter((m) => DECIDED_STATUSES.has(m.status))
      .map((m) => this.toDiscountView(m))
    return { scenarios, discounts }
  }

  async getScenarioReview(id: number): Promise<ScenarioReviewView> {
    const scenario = await this.scenariosService.findOne(id)
    if (!scenario.output) throw new NotFoundException(`Scenario ${id} has no output — run it first`)
    return { ...this.toScenarioView(scenario), output: scenario.output }
  }

  async getDiscountReview(id: number): Promise<DiscountReviewView> {
    const model = this.discountsService.findOne(id)
    if (!model.output) throw new NotFoundException(`Discount model ${id} has no output — run it first`)
    const riskPanels = model.output.riskPanels
    return {
      ...this.toDiscountView(model),
      riskBanner: {
        hardCount: riskPanels.filter((p) => p.isHard).length,
        advisoryCount: riskPanels.filter((p) => !p.isHard && p.severity !== "low").length,
      },
      constraintWarnings: riskPanels.filter((p) => p.severity !== "low").map((p) => p.title),
      competitiveFlags: [],
    }
  }

  private validateReason(dto: DecisionDto): string {
    const comment = dto.comment?.trim() ?? ""
    if (dto.action !== "approve" && comment.length === 0) {
      throw new BadRequestException(
        `A reason/comment is required for "${dto.action}" (one consistent reason-required policy — spec REQ-APPR-012)`,
      )
    }
    return comment
  }

  private recordDecision(domain: "scenario" | "discount", itemId: number, action: ApprovalDecisionAction, comment: string) {
    this.decisions.push({ domain, itemId, action, comment, decidedAt: new Date().toISOString() })
  }

  async decideScenario(id: number, dto: DecisionDto): Promise<ApprovalItemView> {
    const comment = this.validateReason(dto)
    const status = mapActionToStatus(dto.action)
    const updated = await this.scenariosService.updateStatus(id, { status, comment: comment || undefined })
    this.recordDecision("scenario", id, dto.action, comment)
    return this.toScenarioView(updated)
  }

  async decideDiscount(id: number, dto: DecisionDto): Promise<ApprovalItemView> {
    const comment = this.validateReason(dto)
    const status = mapActionToStatus(dto.action)
    const updated = this.discountsService.updateStatus(id, { status })
    this.recordDecision("discount", id, dto.action, comment)
    return this.toDiscountView(updated)
  }
}
