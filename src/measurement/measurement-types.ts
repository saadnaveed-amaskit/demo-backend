export type ExperimentStatus = "setup" | "live" | "concluded"
export type BlockStatus = "Balanced" | "Imbalanced" | "Missing-an-arm"
export type ClusterArm = "treatment" | "control"
export type Verdict = "gathering" | "win" | "kill"

/** Per-metric match percentage (0-1) between a block's treatment and control clusters (REQ-MEAS-004). Balanced when min/max ratio >= 0.8 on each metric (REQ-MEAS-014). */
export interface MetricMatch {
  revenue: number
  grossMargin: number
  velocity: number
}

/** Tier-1 canonical cluster (a comparability-matched group of SKUs) within an experiment block. Arm assignment and rationale drive REQ-MEAS-003/007. */
export interface ClusterView {
  id: number
  blockId: number
  name: string
  arm: ClusterArm
  bauPrice: number
  /** ML-recommended price for this cluster; null while arm is "control" (control runs BAU) — REQ-MEAS-007. */
  mlPrice: number | null
  crossElasticity: number
  confidence: number
}

/** Tier-1 canonical comparability block grouping a treatment and control cluster pair for balanced measurement. */
export interface BlockView {
  id: number
  label: string
  status: BlockStatus
  clusters: ClusterView[]
  /** Optional so the pre-existing approved SLICE-12 preparation contract test's mock (which predates this field) still type-checks unmodified. */
  metricMatch?: MetricMatch
}

export interface CredibleInterval {
  estimate: number
  lower: number
  upper: number
}

/** Per-cluster contribution to the overall lift signal (REQ-MEAS-010). */
export interface ClusterContribution {
  clusterId: number
  name: string
  contribution: number
}

/** Live readout for an experiment that has gone live (REQ-MEAS-008/009/010/011). */
export interface ReadoutView {
  probabilityOfWinning: number
  day: number
  verdict: Verdict
  incrementalMargin: CredibleInterval
  clusterContributions: ClusterContribution[]
}

/** Tier-1 canonical matched-cluster pricing experiment. Setup phase (arm assignment, balance, cost acknowledgment, Go-Live gate) plus live readout once launched. */
export interface ExperimentView {
  id: number
  name: string
  status: ExperimentStatus
  costAcknowledged: boolean
  createdAt: string
  blocks: BlockView[]
  goLiveEligible: boolean
  goLiveBlockedReason: string | null
  readout: ReadoutView | null
}

export interface MoveClusterDto {
  arm: ClusterArm
}
