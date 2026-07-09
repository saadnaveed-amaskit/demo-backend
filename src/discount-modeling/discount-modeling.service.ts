import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common"
import { FocusSetsService } from "../focus-sets/focus-sets.service"
import {
  CreateDiscountModelDto,
  DiscountModelEntity,
  DiscountModelKpis,
  DiscountModelOutput,
  NivoBarDatapoint,
  NivoLineDataset,
  RiskPanel,
  RollupRow,
  UpdateStatusDto,
} from "./discount-model-types"

const AVG_PRICE = 29.99
const UNIT_LIFT_FACTOR = 1.2

const RN_DIVISIONS = [
  "BIG GIRLS",
  "BOYS",
  "TODDLER BOYS",
  "GIRLS",
  "TODDLER GIRLS",
]

const RISK_TEMPLATES: Array<{ title: string; isHard: boolean }> = [
  { title: "Margin Risk", isHard: true },
  { title: "Cannibalization Risk", isHard: false },
  { title: "Inventory Risk", isHard: false },
  { title: "Competitive Risk", isHard: false },
  { title: "Channel Conflict Risk", isHard: false },
  { title: "Brand Equity Risk", isHard: false },
]

function discountRate(
  format: string,
  depth: number | null,
): number {
  if (format === "bogo") return 0.5
  if (depth === null) return 0
  if (format === "percentage") return depth / 100
  return depth / AVG_PRICE
}

function buildHandle(
  format: string,
  depth: number | null,
  channel: string,
  startDate: string,
): string {
  const brand = "TCP"
  const fmt = format === "percentage" ? "PCT" : format === "flat" ? "FLAT" : format === "bogo" ? "BOGO" : "FIXED"
  const dep = depth != null ? String(Math.round(depth)) : "NA"
  const ch = channel.slice(0, 3).toUpperCase()
  const ym = startDate.replace(/-/g, "").slice(0, 6)
  return `${brand}-${fmt}-${dep}-${ch}-SUMMER-${ym}`
}

function buildOutput(entity: Omit<DiscountModelEntity, "output" | "marketingHandle">, skuCount: number): DiscountModelOutput {
  const rate = discountRate(entity.discountFormat, entity.discountDepth)
  const revenueImpact = Math.round(skuCount * AVG_PRICE * rate * UNIT_LIFT_FACTOR * 100) / 100
  const marginImpact = Math.round(revenueImpact * -0.3 * 100) / 100
  const unitLift = Math.min(40, Math.round(rate * 2.5 * 100) / 100)
  const sellThrough = Math.min(98, Math.round((70 + rate * 50) * 10) / 10)
  const incrementalRevenue = Math.round(revenueImpact * 0.6 * 100) / 100

  const kpis: DiscountModelKpis = {
    revenueImpact,
    marginImpact,
    unitLift,
    sellThrough,
    incrementalRevenue,
  }

  const weeks = ["Wk 1", "Wk 2", "Wk 3", "Wk 4", "Wk 5", "Wk 6", "Wk 7", "Wk 8"]
  const baseRevPerWk = Math.round(skuCount * AVG_PRICE * 0.6)
  const promRevPerWk = Math.round(baseRevPerWk * (1 + rate * UNIT_LIFT_FACTOR))

  const forecastRevenue: NivoLineDataset[] = [
    {
      id: "Baseline",
      data: weeks.map((x, i) => ({ x, y: Math.round(baseRevPerWk * (0.8 + i * 0.04)) })),
    },
    {
      id: "Promoted",
      data: weeks.map((x, i) => ({ x, y: Math.round(promRevPerWk * (0.8 + i * 0.04)) })),
    },
  ]

  const baseMgn = Math.round(baseRevPerWk * 0.45)
  const promMgn = Math.round(baseMgn * (1 - rate * 0.3))

  const forecastMargin: NivoLineDataset[] = [
    {
      id: "Baseline",
      data: weeks.map((x, i) => ({ x, y: Math.round(baseMgn * (0.8 + i * 0.04)) })),
    },
    {
      id: "Promoted",
      data: weeks.map((x, i) => ({ x, y: Math.round(promMgn * (0.8 + i * 0.04)) })),
    },
  ]

  const baseUnits = Math.round(skuCount * 0.4)
  const promUnits = Math.round(baseUnits * (1 + rate * 2))

  const forecastUnits: NivoBarDatapoint[] = weeks.map((week, i) => ({
    week,
    Baseline: Math.round(baseUnits * (0.8 + i * 0.04)),
    Promoted: Math.round(promUnits * (0.8 + i * 0.04)),
  }))

  const divSkus = Math.max(1, Math.floor(skuCount / RN_DIVISIONS.length))
  const rollupRows: RollupRow[] = RN_DIVISIONS.map((label, i) => {
    const st = Math.min(98, sellThrough + (i % 3 === 0 ? 8 : i % 3 === 1 ? -5 : 2))
    return {
      label,
      skuCount: divSkus,
      revenue: Math.round(revenueImpact / RN_DIVISIONS.length),
      margin: Math.round(marginImpact / RN_DIVISIONS.length),
      sellThrough: Math.round(st * 10) / 10,
      stockOutRisk: st > 92,
      confidence: Math.round((0.7 + rate * 0.2) * 100) / 100,
    }
  })

  const riskPanels: RiskPanel[] = RISK_TEMPLATES.map((t, i) => ({
    title: t.title,
    severity: i === 0 && rate > 0.3 ? "high" : rate > 0.15 ? "medium" : "low",
    description: `${t.title}: ${rate > 0.2 ? "Elevated exposure at this discount depth." : "Within acceptable parameters."}`,
    isHard: t.isHard,
  }))

  const narrative = `This ${entity.discountFormat} discount of ${entity.discountDepth ?? "50%"}${entity.discountFormat === "percentage" ? "%" : entity.discountFormat === "bogo" ? "" : "$"} applied to ${skuCount} SKUs is projected to drive $${revenueImpact.toLocaleString()} in incremental revenue over the ${weeks.length}-week horizon. Sell-through is forecast at ${sellThrough}%, with margin compression of $${Math.abs(marginImpact).toLocaleString()}.`

  return {
    narrative,
    marketingHandle: buildHandle(entity.discountFormat, entity.discountDepth, entity.channel, entity.startDate),
    kpis,
    forecastRevenue,
    forecastMargin,
    forecastUnits,
    rollupRows,
    riskPanels,
  }
}

@Injectable()
export class DiscountModelingService {
  private store: DiscountModelEntity[] = []
  private nextId = 1

  constructor(private readonly focusSetsService: FocusSetsService) {}

  findAll(): DiscountModelEntity[] {
    return [...this.store].sort((a, b) => b.id - a.id)
  }

  findOne(id: number): DiscountModelEntity {
    const m = this.store.find((x) => x.id === id)
    if (!m) throw new NotFoundException(`Discount model ${id} not found`)
    return m
  }

  create(dto: CreateDiscountModelDto): DiscountModelEntity {
    let focusGroupName = ""
    let skuCount = 0

    if (dto.focusGroupId) {
      try {
        const fs = this.focusSetsService.findOne(dto.focusGroupId)
        focusGroupName = fs.name
        skuCount = fs.productCount
      } catch {
        // focusGroupId provided but not found — keep defaults
      }
    }

    const entity: DiscountModelEntity = {
      id: this.nextId++,
      name: dto.name,
      focusGroupId: dto.focusGroupId ?? "",
      focusGroupName,
      skuCount,
      startDate: dto.startDate,
      endDate: dto.endDate,
      discountFormat: dto.discountFormat,
      discountDepth: dto.discountDepth ?? null,
      channel: dto.channel,
      status: "new",
      createdAt: new Date().toISOString(),
      marketingHandle: "",
      output: null,
    }
    this.store.push(entity)
    return entity
  }

  run(id: number): DiscountModelEntity {
    const m = this.findOne(id)
    const output = buildOutput(m, m.skuCount || 10)
    m.output = output
    m.marketingHandle = output.marketingHandle
    m.status = "draft"
    return m
  }

  submit(id: number): DiscountModelEntity {
    const m = this.findOne(id)
    if (m.status !== "draft") {
      throw new BadRequestException(`Cannot submit model in status '${m.status}'; must be draft`)
    }
    m.status = "pending"
    return m
  }

  updateStatus(id: number, dto: UpdateStatusDto): DiscountModelEntity {
    const m = this.findOne(id)
    m.status = dto.status
    return m
  }

  remove(id: number): void {
    const idx = this.store.findIndex((x) => x.id === id)
    if (idx === -1) throw new NotFoundException(`Discount model ${id} not found`)
    this.store.splice(idx, 1)
  }
}
