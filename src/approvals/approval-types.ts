import type { ChangeRequest, ScenarioOutput } from "../price-scenarios/price-scenario-types"

export type ApprovalDomain = "scenario" | "discount"
export type ApprovalStatus = "pending" | "approved" | "denied" | "returned"
export type ApprovalDecisionAction = "approve" | "deny" | "request_changes"
export type ApprovalRisk = "Low" | "Medium" | "High"

export interface DecisionDto {
  action: ApprovalDecisionAction
  comment?: string
}

/** Tier-2 aggregated queue row, computed on read from a ScenarioEntity or DiscountModelEntity. */
export interface ApprovalItemView {
  domain: ApprovalDomain
  id: number
  name: string
  submitter: string
  team: string
  brand: string
  division: string
  impact: string
  risk: ApprovalRisk
  status: ApprovalStatus
  changeRequests: ChangeRequest[]
}

export interface ApprovalsQueueView {
  scenarios: ApprovalItemView[]
  discounts: ApprovalItemView[]
  scenarioPendingCount: number
  discountPendingCount: number
}

export interface ApprovalsDecidedView {
  scenarios: ApprovalItemView[]
  discounts: ApprovalItemView[]
}

export interface DiscountRiskBanner {
  hardCount: number
  advisoryCount: number
}

export interface DiscountReviewView extends ApprovalItemView {
  riskBanner: DiscountRiskBanner
  constraintWarnings: string[]
  competitiveFlags: string[]
}

export interface ScenarioReviewView extends ApprovalItemView {
  output: ScenarioOutput
}
