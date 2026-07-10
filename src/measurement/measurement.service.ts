import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common"
import type {
  BlockStatus,
  BlockView,
  ClusterArm,
  ClusterView,
  ExperimentView,
  MetricMatch,
  MoveClusterDto,
  ReadoutView,
} from "./measurement-types"

/** Balance rule (REQ-MEAS-014): a block is Balanced when min/max ratio >= 0.8 on each metric. */
const MIN_BALANCE_RATIO = 0.8

interface StoredCluster {
  id: number
  blockId: number
  name: string
  arm: ClusterArm
  bauPrice: number
  /** ML-recommended price, retained even while arm is "control" so moving back to treatment restores it (REQ-MEAS-007). */
  recommendedMlPrice: number
  crossElasticity: number
  confidence: number
}

interface StoredBlock {
  id: number
  label: string
  metricMatch: MetricMatch
  clusters: StoredCluster[]
}

interface StoredExperiment {
  id: number
  name: string
  status: "setup" | "live" | "concluded"
  costAcknowledged: boolean
  createdAt: string
  blocks: StoredBlock[]
  readout: ReadoutView | null
}

const EXPERIMENT_SEED: StoredExperiment[] = [
  {
    id: 1,
    name: "Markdown Test — Girls Denim",
    status: "setup",
    costAcknowledged: false,
    createdAt: "2026-07-01T00:00:00.000Z",
    blocks: [
      {
        id: 1,
        label: "Block A",
        metricMatch: { revenue: 0.95, grossMargin: 0.93, velocity: 0.91 },
        clusters: [
          { id: 101, blockId: 1, name: "Cluster 101", arm: "treatment", bauPrice: 29.99, recommendedMlPrice: 24.99, crossElasticity: 0.4, confidence: 0.82 },
          { id: 102, blockId: 1, name: "Cluster 102", arm: "control", bauPrice: 29.99, recommendedMlPrice: 24.99, crossElasticity: 0.35, confidence: 0.8 },
        ],
      },
      {
        id: 2,
        label: "Block B",
        metricMatch: { revenue: 0.62, grossMargin: 0.7, velocity: 0.75 },
        clusters: [
          { id: 103, blockId: 2, name: "Cluster 103", arm: "treatment", bauPrice: 19.99, recommendedMlPrice: 16.99, crossElasticity: 0.5, confidence: 0.7 },
          { id: 104, blockId: 2, name: "Cluster 104", arm: "control", bauPrice: 19.99, recommendedMlPrice: 16.99, crossElasticity: 0.45, confidence: 0.68 },
        ],
      },
    ],
    readout: null,
  },
  {
    id: 2,
    name: "Promo Depth Test — Boys Outerwear",
    status: "setup",
    costAcknowledged: false,
    createdAt: "2026-07-02T00:00:00.000Z",
    blocks: [
      {
        id: 3,
        label: "Block A",
        metricMatch: { revenue: 0.9, grossMargin: 0.88, velocity: 0.85 },
        clusters: [
          { id: 10, blockId: 3, name: "Cluster 10", arm: "treatment", bauPrice: 29.99, recommendedMlPrice: 24.99, crossElasticity: 0.4, confidence: 0.82 },
          { id: 11, blockId: 3, name: "Cluster 11", arm: "control", bauPrice: 19.99, recommendedMlPrice: 17.99, crossElasticity: 0.3, confidence: 0.75 },
        ],
      },
    ],
    readout: null,
  },
  {
    id: 3,
    name: "Clearance Push — Footwear",
    status: "live",
    costAcknowledged: true,
    createdAt: "2026-06-20T00:00:00.000Z",
    blocks: [
      {
        id: 4,
        label: "Block A",
        metricMatch: { revenue: 0.93, grossMargin: 0.9, velocity: 0.88 },
        clusters: [
          { id: 40, blockId: 4, name: "Cluster 40", arm: "treatment", bauPrice: 34.99, recommendedMlPrice: 27.99, crossElasticity: 0.55, confidence: 0.9 },
          { id: 41, blockId: 4, name: "Cluster 41", arm: "control", bauPrice: 34.99, recommendedMlPrice: 27.99, crossElasticity: 0.5, confidence: 0.88 },
        ],
      },
    ],
    readout: {
      probabilityOfWinning: 0.97,
      day: 14,
      verdict: "win",
      incrementalMargin: { estimate: 42000, lower: 28000, upper: 56000 },
      clusterContributions: [{ clusterId: 40, name: "Cluster 40", contribution: 42000 }],
    },
  },
]

function deriveBlockStatus(clusters: StoredCluster[], metricMatch: MetricMatch): BlockStatus {
  const hasTreatment = clusters.some((c) => c.arm === "treatment")
  const hasControl = clusters.some((c) => c.arm === "control")
  if (!hasTreatment || !hasControl) return "Missing-an-arm"
  const ratios = [metricMatch.revenue, metricMatch.grossMargin, metricMatch.velocity]
  return ratios.every((r) => r >= MIN_BALANCE_RATIO) ? "Balanced" : "Imbalanced"
}

function toClusterView(cluster: StoredCluster): ClusterView {
  return {
    id: cluster.id,
    blockId: cluster.blockId,
    name: cluster.name,
    arm: cluster.arm,
    bauPrice: cluster.bauPrice,
    mlPrice: cluster.arm === "control" ? null : cluster.recommendedMlPrice,
    crossElasticity: cluster.crossElasticity,
    confidence: cluster.confidence,
  }
}

function toBlockView(block: StoredBlock): BlockView {
  return {
    id: block.id,
    label: block.label,
    status: deriveBlockStatus(block.clusters, block.metricMatch),
    clusters: block.clusters.map(toClusterView),
    metricMatch: block.metricMatch,
  }
}

function computeEligibility(exp: StoredExperiment): { eligible: boolean; reason: string | null } {
  if (exp.status !== "setup") {
    return { eligible: false, reason: `Cannot go live: experiment status is "${exp.status}"` }
  }
  const unbalancedCount = exp.blocks.filter((b) => deriveBlockStatus(b.clusters, b.metricMatch) !== "Balanced").length
  const reasons: string[] = []
  if (unbalancedCount > 0) {
    reasons.push(`${unbalancedCount} block${unbalancedCount === 1 ? " is" : "s are"} imbalanced`)
  }
  if (!exp.costAcknowledged) {
    reasons.push("the cost of control has not been acknowledged")
  }
  if (reasons.length === 0) return { eligible: true, reason: null }
  return { eligible: false, reason: reasons.join(" and ") }
}

@Injectable()
export class MeasurementService {
  private experiments: StoredExperiment[] = EXPERIMENT_SEED.map((e) => ({
    ...e,
    blocks: e.blocks.map((b) => ({ ...b, clusters: b.clusters.map((c) => ({ ...c })) })),
    readout: e.readout ? { ...e.readout } : null,
  }))

  private find(id: number): StoredExperiment {
    const exp = this.experiments.find((e) => e.id === id)
    if (!exp) throw new NotFoundException(`Experiment ${id} not found`)
    return exp
  }

  private toView(exp: StoredExperiment): ExperimentView {
    const { eligible, reason } = computeEligibility(exp)
    return {
      id: exp.id,
      name: exp.name,
      status: exp.status,
      costAcknowledged: exp.costAcknowledged,
      createdAt: exp.createdAt,
      blocks: exp.blocks.map(toBlockView),
      goLiveEligible: eligible,
      goLiveBlockedReason: reason,
      readout: exp.readout,
    }
  }

  listExperiments(): ExperimentView[] {
    return this.experiments.map((e) => this.toView(e))
  }

  getExperiment(id: number): ExperimentView {
    return this.toView(this.find(id))
  }

  moveCluster(experimentId: number, clusterId: number, dto: MoveClusterDto): ClusterView {
    if (dto?.arm !== "treatment" && dto?.arm !== "control") {
      throw new BadRequestException('arm must be "treatment" or "control"')
    }
    const exp = this.find(experimentId)
    for (const block of exp.blocks) {
      const cluster = block.clusters.find((c) => c.id === clusterId)
      if (cluster) {
        cluster.arm = dto.arm
        return toClusterView(cluster)
      }
    }
    throw new NotFoundException(`Cluster ${clusterId} not found in experiment ${experimentId}`)
  }

  acknowledgeCost(id: number): ExperimentView {
    const exp = this.find(id)
    exp.costAcknowledged = true
    return this.toView(exp)
  }

  goLive(id: number): ExperimentView {
    const exp = this.find(id)
    const { eligible, reason } = computeEligibility(exp)
    if (!eligible) throw new BadRequestException(reason)
    exp.status = "live"
    exp.readout = {
      probabilityOfWinning: 0.5,
      day: 1,
      verdict: "gathering",
      incrementalMargin: { estimate: 0, lower: 0, upper: 0 },
      clusterContributions: [],
    }
    return this.toView(exp)
  }

  scale(id: number): ExperimentView {
    const exp = this.find(id)
    if (exp.status !== "live") {
      throw new BadRequestException(`Cannot scale: experiment status is "${exp.status}", must be "live"`)
    }
    exp.status = "concluded"
    return this.toView(exp)
  }

  kill(id: number): ExperimentView {
    const exp = this.find(id)
    if (exp.status !== "live") {
      throw new BadRequestException(`Cannot kill: experiment status is "${exp.status}", must be "live"`)
    }
    for (const block of exp.blocks) {
      for (const cluster of block.clusters) {
        if (cluster.arm === "treatment") cluster.arm = "control"
      }
    }
    exp.status = "concluded"
    return this.toView(exp)
  }
}
