import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common"
import type {
  ActionClassEntity,
  AuditEntry,
  AutonomyKpis,
  AutonomyRosterView,
  KillSwitchState,
  LiveActionEntity,
  ReversibilityClass,
  TrustRung,
} from "./autonomy-types"

const TRUST_LADDER: TrustRung[] = ["Manual", "Supervised", "Autonomous"]

/** Reversibility class hard-ceilings the highest trust rung an action class may reach (REQ-AUTO-009). */
const REVERSIBILITY_CEILING: Record<ReversibilityClass, TrustRung> = {
  Low: "Supervised",
  Medium: "Autonomous",
  High: "Autonomous",
}

const MIN_SAMPLE_COUNT = 100
const MIN_ACCURACY = 0.85
const MIN_ACCEPTANCE_RATE = 0.8

interface StoredActionClass {
  id: number
  name: string
  trustRung: TrustRung
  reversibilityClass: ReversibilityClass
  sampleCount: number
  accuracy: number
  acceptanceRate: number
  liveDollarValue: number
  createdAt: string
}

const ACTION_CLASS_SEED: StoredActionClass[] = [
  {
    id: 1,
    name: "Markdown Threshold Adjustment",
    trustRung: "Supervised",
    reversibilityClass: "Low",
    sampleCount: 120,
    accuracy: 0.92,
    acceptanceRate: 0.88,
    liveDollarValue: 125000,
    createdAt: "2026-06-15T00:00:00.000Z",
  },
  {
    id: 2,
    name: "Promo Depth Recommendation",
    trustRung: "Manual",
    reversibilityClass: "Medium",
    sampleCount: 60,
    accuracy: 0.79,
    acceptanceRate: 0.7,
    liveDollarValue: 0,
    createdAt: "2026-06-20T00:00:00.000Z",
  },
  {
    id: 3,
    name: "Clearance Auto-Apply",
    trustRung: "Autonomous",
    reversibilityClass: "High",
    sampleCount: 210,
    accuracy: 0.95,
    acceptanceRate: 0.91,
    liveDollarValue: 340000,
    createdAt: "2026-05-01T00:00:00.000Z",
  },
]

const LIVE_ACTION_SEED: LiveActionEntity[] = [
  {
    id: 1,
    actionClassId: 3,
    description: "Auto-apply clearance markdown on SKU-4021 (Aggressive band)",
    status: "pending",
    vetoWindowSeconds: 300,
    engagedAt: "2026-07-10T08:00:00.000Z",
  },
  {
    id: 2,
    actionClassId: 3,
    description: "Auto-applied clearance markdown on SKU-3980",
    status: "applied",
    vetoWindowSeconds: 300,
    engagedAt: "2026-07-09T08:00:00.000Z",
  },
]

function reversibilityCeilingBlocked(ac: StoredActionClass): boolean {
  return ac.trustRung === REVERSIBILITY_CEILING[ac.reversibilityClass]
}

function toView(ac: StoredActionClass): ActionClassEntity {
  return { ...ac, atReversibilityCeiling: reversibilityCeilingBlocked(ac) }
}

@Injectable()
export class AutonomyService {
  private actionClasses: StoredActionClass[] = ACTION_CLASS_SEED.map((a) => ({ ...a }))
  private liveActions: LiveActionEntity[] = LIVE_ACTION_SEED.map((a) => ({ ...a }))
  private audit: AuditEntry[] = []
  private nextAuditId = 1
  private killSwitchEngaged = false

  private findActionClass(id: number): StoredActionClass {
    const ac = this.actionClasses.find((a) => a.id === id)
    if (!ac) throw new NotFoundException(`Action class ${id} not found`)
    return ac
  }

  private findLiveAction(id: number): LiveActionEntity {
    const la = this.liveActions.find((a) => a.id === id)
    if (!la) throw new NotFoundException(`Live action ${id} not found`)
    return la
  }

  private recordAudit(actionClassId: number, action: string) {
    this.audit.push({ id: this.nextAuditId++, actionClassId, action, actor: "Pricing Strategist", timestamp: new Date().toISOString() })
  }

  private requireKillSwitchDisengaged() {
    if (this.killSwitchEngaged) {
      throw new BadRequestException("Blocked: kill switch is engaged")
    }
  }

  private buildKpis(): AutonomyKpis {
    const eligibleToPromote = this.actionClasses.filter((a) => !reversibilityCeilingBlocked(a)).length
    const totalLiveDollarValue = this.actionClasses.reduce((sum, a) => sum + a.liveDollarValue, 0)
    const averageProofAccuracy =
      this.actionClasses.length === 0
        ? 0
        : this.actionClasses.reduce((sum, a) => sum + a.accuracy, 0) / this.actionClasses.length
    return {
      totalActionClasses: this.actionClasses.length,
      eligibleToPromote,
      totalLiveDollarValue,
      averageProofAccuracy: Math.round(averageProofAccuracy * 1000) / 1000,
    }
  }

  getRoster(): AutonomyRosterView {
    return {
      kpis: this.buildKpis(),
      actionClasses: this.actionClasses.map(toView),
      liveActions: [...this.liveActions],
      killSwitchEngaged: this.killSwitchEngaged,
    }
  }

  getAudit(id: number): AuditEntry[] {
    this.findActionClass(id)
    return this.audit.filter((a) => a.actionClassId === id)
  }

  promote(id: number): ActionClassEntity {
    this.requireKillSwitchDisengaged()
    const ac = this.findActionClass(id)

    // Ordered blockers per REQ-AUTO-009: reversibility ceiling -> sample count -> accuracy -> acceptance rate.
    if (reversibilityCeilingBlocked(ac)) {
      throw new BadRequestException(
        `Blocked: "${ac.name}" is at its reversibility ceiling (${REVERSIBILITY_CEILING[ac.reversibilityClass]} for ${ac.reversibilityClass} reversibility)`,
      )
    }
    if (ac.sampleCount < MIN_SAMPLE_COUNT) {
      throw new BadRequestException(`Blocked: sample count ${ac.sampleCount} is below the minimum of ${MIN_SAMPLE_COUNT}`)
    }
    if (ac.accuracy < MIN_ACCURACY) {
      throw new BadRequestException(`Blocked: accuracy ${ac.accuracy} is below the minimum of ${MIN_ACCURACY}`)
    }
    if (ac.acceptanceRate < MIN_ACCEPTANCE_RATE) {
      throw new BadRequestException(`Blocked: acceptance rate ${ac.acceptanceRate} is below the minimum of ${MIN_ACCEPTANCE_RATE}`)
    }

    const currentIndex = TRUST_LADDER.indexOf(ac.trustRung)
    ac.trustRung = TRUST_LADDER[Math.min(currentIndex + 1, TRUST_LADDER.length - 1)]
    this.recordAudit(id, `Promoted to ${ac.trustRung}`)
    return toView(ac)
  }

  demote(id: number): ActionClassEntity {
    // REQ-AUTO-006: demote is allowed at any time without gating, including while the kill switch is engaged.
    const ac = this.findActionClass(id)
    const currentIndex = TRUST_LADDER.indexOf(ac.trustRung)
    ac.trustRung = TRUST_LADDER[Math.max(currentIndex - 1, 0)]
    this.recordAudit(id, `Demoted to ${ac.trustRung}`)
    return toView(ac)
  }

  veto(id: number): LiveActionEntity {
    this.requireKillSwitchDisengaged()
    const la = this.findLiveAction(id)
    if (la.status !== "pending") {
      throw new BadRequestException(`Cannot veto live action ${id} with status "${la.status}"; must be "pending"`)
    }
    la.status = "vetoed"
    this.recordAudit(la.actionClassId, `Vetoed live action ${id}`)
    return la
  }

  undo(id: number): LiveActionEntity {
    this.requireKillSwitchDisengaged()
    const la = this.findLiveAction(id)
    if (la.status !== "applied") {
      throw new BadRequestException(`Cannot undo live action ${id} with status "${la.status}"; must be "applied"`)
    }
    la.status = "undone"
    this.recordAudit(la.actionClassId, `Undid live action ${id}`)
    return la
  }

  engageKillSwitch(): KillSwitchState {
    this.killSwitchEngaged = true
    return { killSwitchEngaged: true }
  }

  disengageKillSwitch(): KillSwitchState {
    this.killSwitchEngaged = false
    return { killSwitchEngaged: false }
  }
}
