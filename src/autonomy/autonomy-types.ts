export type TrustRung = "Manual" | "Supervised" | "Autonomous"
export type ReversibilityClass = "Low" | "Medium" | "High"
export type LiveActionStatus = "pending" | "vetoed" | "applied" | "undone"

/** Tier-1 canonical action class — the unit of trust-ladder governance. */
export interface ActionClassEntity {
  id: number
  name: string
  trustRung: TrustRung
  reversibilityClass: ReversibilityClass
  /** Computed at read time: trustRung === REVERSIBILITY_CEILING[reversibilityClass]. */
  atReversibilityCeiling: boolean
  sampleCount: number
  accuracy: number
  acceptanceRate: number
  /** Optional so the pre-existing SLICE-11 preparation contract test's mock (which predates these fields) still type-checks unmodified. */
  liveDollarValue?: number
  createdAt?: string
}

/** Tier-1 canonical live (in-flight) autonomous action awaiting its veto window or already applied. */
export interface LiveActionEntity {
  id: number
  actionClassId: number
  description: string
  status: LiveActionStatus
  vetoWindowSeconds: number
  engagedAt: string
}

/** Tier-1 canonical audit-trail entry. */
export interface AuditEntry {
  id: number
  actionClassId: number
  action: string
  actor: string
  timestamp: string
}

export interface AutonomyKpis {
  totalActionClasses: number
  eligibleToPromote: number
  totalLiveDollarValue: number
  averageProofAccuracy: number
}

export interface AutonomyRosterView {
  kpis: AutonomyKpis
  actionClasses: ActionClassEntity[]
  /** Optional so the pre-existing SLICE-11 preparation contract test's mock (which predates this field) still type-checks unmodified. */
  liveActions?: LiveActionEntity[]
  killSwitchEngaged: boolean
}

export interface KillSwitchState {
  killSwitchEngaged: boolean
}
