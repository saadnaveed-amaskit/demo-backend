/** Tier-1 canonical discount model entity (pricing domain). */
export interface DiscountModelEntity {
  id: number
  name: string
  focusGroupId: string
  focusGroupName: string
  skuCount: number
  startDate: string
  endDate: string
  discountFormat: "percentage" | "flat" | "bogo" | "fixed"
  discountDepth: number | null
  channel: string
  status: "new" | "draft" | "pending" | "approved" | "returned" | "denied"
  createdAt: string
  marketingHandle: string
  output: DiscountModelOutput | null
}

export interface CreateDiscountModelDto {
  name: string
  focusGroupId: string
  startDate: string
  endDate: string
  discountFormat: "percentage" | "flat" | "bogo" | "fixed"
  discountDepth?: number
  channel: string
}

export interface UpdateStatusDto {
  status: "new" | "draft" | "pending" | "approved" | "returned" | "denied"
}

/** Tier-2 output produced by the run endpoint. */
export interface DiscountModelOutput {
  narrative: string
  marketingHandle: string
  kpis: DiscountModelKpis
  forecastRevenue: NivoLineDataset[]
  forecastMargin: NivoLineDataset[]
  forecastUnits: NivoBarDatapoint[]
  rollupRows: RollupRow[]
  riskPanels: RiskPanel[]
}

export interface DiscountModelKpis {
  revenueImpact: number
  marginImpact: number
  unitLift: number
  sellThrough: number
  incrementalRevenue: number
}

export interface NivoLineDataset {
  id: string
  data: Array<{ x: string; y: number }>
}

export interface NivoBarDatapoint {
  week: string
  Baseline: number
  Promoted: number
}

/** Tier-2 table row in the rollup tab. */
export interface RollupRow {
  label: string
  skuCount: number
  revenue: number
  margin: number
  sellThrough: number
  stockOutRisk: boolean
  confidence: number
}

export interface RiskPanel {
  title: string
  severity: "high" | "medium" | "low"
  description: string
  isHard: boolean
}
