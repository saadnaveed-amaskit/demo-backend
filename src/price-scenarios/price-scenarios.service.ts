import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common"
import { FocusSetsService } from "../focus-sets/focus-sets.service"
import { GuardrailsService } from "../guardrails/guardrails.service"
import {
  ChangeRequest,
  ComparisonRow,
  CreateScenarioDto,
  DeepDiveOutput,
  DiscountTile,
  DiscountTileProduct,
  FrontierPoint,
  MarketingTile,
  MarketingTileProduct,
  Recommendation,
  ScenarioEntity,
  ScenarioGuardrailCheck,
  ScenarioOutput,
  SkuRecommendationRow,
  UpdateStatusDto,
} from "./price-scenario-types"

const AVG_PRICE = 29.99
const WEEKS = 26
const SELL_THROUGH_ASSUMPTION = 0.8
const MARGIN = 0.35

const RISK_BAND_TEMPLATES: Recommendation[] = [
  { tag: "Pricing", text: "Consider targeted markdown on slow-moving hero SKUs to accelerate sell-through." },
  { tag: "Marketing", text: "Coordinate digital campaign with price reduction to amplify revenue uplift." },
  { tag: "Merch", text: "Shift replenishment focus to high-velocity SKUs ahead of event window." },
  { tag: "Inventory", text: "Monitor stock-out risk on top-10 SKUs; reserve safety stock before activation." },
  { tag: "Pricing", text: "Apply graduated discount tiers to protect margin on premium lines." },
  { tag: "Marketing", text: "Bundle deal messaging recommended for Aggressive and Full Optimization bands." },
]

function buildFrontierPoint(level: number, baseRevenue: number, baseProfit: number): FrontierPoint {
  const revenue = baseRevenue * (1 + (level / 100) * 0.22)
  const profit = baseProfit * (1 + (level / 100) * 0.28 * (1 - level / 180))
  return { level, revenue: Math.round(revenue), profit: Math.round(profit) }
}

function buildGuardrailResults(guardrailsService: GuardrailsService, metrics: Record<string, number>): ScenarioGuardrailCheck[] {
  const all = guardrailsService.findAll()
  const active = all.filter((g) => g.active)
  return active.map((g) => {
    const actual = metrics[g.rule] ?? 40
    const threshold = parseFloat(g.value)
    let passed = true
    if (g.op === ">=") passed = actual >= threshold
    else if (g.op === "<=") passed = actual <= threshold
    return {
      id: g.id,
      rule: g.rule,
      op: g.op,
      threshold: g.value,
      unit: g.unit,
      actual,
      passed,
      isOverridable: g.isOverridable,
      severity: g.isOverridable ? "advisory" : "hard",
    }
  })
}

function buildComparison(
  optimizationLevel: number,
  objectives: { revenue: number; grossMargin: number; sellThrough: number },
  current: FrontierPoint,
  scenario: FrontierPoint,
  mlRec: FrontierPoint,
): ComparisonRow[] {
  const revUplift = (((scenario.revenue - current.revenue) / current.revenue) * 100).toFixed(1)
  const marginCurrent = current.revenue > 0 ? (current.profit / current.revenue) * 100 : 0
  const marginScenario = scenario.revenue > 0 ? (scenario.profit / scenario.revenue) * 100 : 0
  const marginDelta = (marginScenario - marginCurrent).toFixed(1)
  const fullPriceMix = (70 + optimizationLevel * 0.12).toFixed(1)
  const sellThrough = Math.min(99, objectives.sellThrough + optimizationLevel * 0.05).toFixed(1)
  const invRisk = optimizationLevel <= 40 ? "Low" : optimizationLevel <= 70 ? "Medium" : "High"
  const mlRevUplift = (((mlRec.revenue - current.revenue) / current.revenue) * 100).toFixed(1)
  const mlMarginDelta = ((mlRec.profit / mlRec.revenue) * 100 - marginCurrent).toFixed(1)

  return [
    {
      metric: "Revenue",
      current: `$${(current.revenue / 1000).toFixed(0)}k`,
      scenario: `$${(scenario.revenue / 1000).toFixed(0)}k`,
      mlRec: `$${(mlRec.revenue / 1000).toFixed(0)}k`,
    },
    {
      metric: "Profit",
      current: `$${(current.profit / 1000).toFixed(0)}k`,
      scenario: `$${(scenario.profit / 1000).toFixed(0)}k`,
      mlRec: `$${(mlRec.profit / 1000).toFixed(0)}k`,
    },
    {
      metric: "Rev Uplift",
      current: "0.0%",
      scenario: `+${revUplift}%`,
      mlRec: `+${mlRevUplift}%`,
    },
    {
      metric: "Margin Δ",
      current: "0.0pp",
      scenario: `${marginDelta}pp`,
      mlRec: `${mlMarginDelta}pp`,
    },
    {
      metric: "Full-Price Mix",
      current: "70.0%",
      scenario: `${fullPriceMix}%`,
      mlRec: `${(70 + 55 * 0.12).toFixed(1)}%`,
    },
    {
      metric: "Sell-Through",
      current: `${objectives.sellThrough}%`,
      scenario: `${sellThrough}%`,
      mlRec: `${Math.min(99, objectives.sellThrough + 55 * 0.05).toFixed(1)}%`,
    },
    {
      metric: "Inventory Risk",
      current: "Low",
      scenario: invRisk,
      mlRec: "Medium",
    },
  ]
}

function buildOutput(scenario: ScenarioEntity, guardrailsService: GuardrailsService): ScenarioOutput {
  const baseRevenue = scenario.skuCount * AVG_PRICE * WEEKS * SELL_THROUGH_ASSUMPTION
  const baseProfit = baseRevenue * MARGIN

  const frontier: FrontierPoint[] = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((l) =>
    buildFrontierPoint(l, baseRevenue, baseProfit),
  )

  const currentPoint = frontier[0]
  const mlRecPoint = buildFrontierPoint(55, baseRevenue, baseProfit)
  const scenarioPoint = buildFrontierPoint(scenario.optimizationLevel, baseRevenue, baseProfit)

  const metrics: Record<string, number> = {
    "Gross Margin": MARGIN * 100 * (1 + scenario.optimizationLevel * 0.001),
  }
  const guardrailResults = buildGuardrailResults(guardrailsService, metrics)
  const comparison = buildComparison(
    scenario.optimizationLevel,
    scenario.objectives,
    currentPoint,
    scenarioPoint,
    mlRecPoint,
  )

  const narrative = `This scenario optimizes pricing at level ${scenario.optimizationLevel}% ` +
    `across ${scenario.skuCount} SKUs. Revenue uplift of ` +
    `${(((scenarioPoint.revenue - currentPoint.revenue) / currentPoint.revenue) * 100).toFixed(1)}% ` +
    `is projected over the event window. The ML Recommendation at 55% balances revenue growth ` +
    `and margin preservation. Objectives weighted: Revenue ${scenario.objectives.revenue}%, ` +
    `Gross Margin ${scenario.objectives.grossMargin}%, Sell-Through ${scenario.objectives.sellThrough}%.`

  const recommendations = RISK_BAND_TEMPLATES.slice(0, 4)

  return {
    narrative,
    uncertainty: "±8–15% depending on data recency and competitor response",
    guardrailResults,
    comparison,
    frontier,
    currentPoint,
    mlRecPoint,
    scenarioPoint,
    recommendations,
  }
}

const CATEGORIES = ["Tops", "Bottoms", "Outerwear", "Accessories", "Footwear"]
const BRANDS = ["TCP", "Carter's", "OshKosh", "Skip Hop"]
const CAMPAIGN_TYPES = ["Email Blast", "Display", "Social", "In-Store", "Push"]
const DISCOUNT_TYPES = ["Clearance", "Promo", "Flash Sale", "Bundle", "Loyalty"]

function buildDeepDive(scenario: ScenarioEntity): DeepDiveOutput {
  const total = Math.min(20, scenario.skuCount)

  const priceAdjustments: SkuRecommendationRow[] = Array.from({ length: total }, (_, i) => {
    const currentPrice = 19.99 + (i % 7) * 5
    const changePct = -2 - (i % 8) * 1.5
    const recommendedPrice = Math.max(9.99, currentPrice * (1 + changePct / 100))
    const unlockLevel = Math.floor((i / total) * 100)
    const roundedUnlock = Math.floor(unlockLevel / 10) * 10
    return {
      sku: `SKU-${1000 + i}`,
      productName: `${CATEGORIES[i % CATEGORIES.length]} Style ${String.fromCharCode(65 + (i % 26))}`,
      category: CATEGORIES[i % CATEGORIES.length],
      brand: BRANDS[i % BRANDS.length],
      currentPrice: Math.round(currentPrice * 100) / 100,
      recommendedPrice: Math.round(recommendedPrice * 100) / 100,
      priceChange: Math.round((recommendedPrice - currentPrice) * 100) / 100,
      priceChangePct: Math.round(changePct * 10) / 10,
      currentGrossMargin: 35 + (i % 10),
      projectedGrossMargin: 33 + (i % 10) + scenario.optimizationLevel * 0.02,
      weeklyRevenue: Math.round(currentPrice * 40),
      projectedRevenue: Math.round(recommendedPrice * 40 * 1.08),
      currentWeeksOfSupply: 6 + (i % 8),
      projectedWeeksOfSupply: 4 + (i % 6),
      unlockLevel: roundedUnlock,
    }
  })

  const UNLOCK_LEVELS = [0, 20, 40, 60, 80]

  const marketingTiles: MarketingTile[] = UNLOCK_LEVELS.map((unlockLevel, i) => {
    const products: MarketingTileProduct[] = Array.from({ length: 3 }, (_, j) => ({
      sku: `SKU-${2000 + i * 3 + j}`,
      productName: `${CATEGORIES[(i + j) % CATEGORIES.length]} Promo Item ${j + 1}`,
      currentPrice: 24.99 + j * 5,
      promoPrice: Math.round((24.99 + j * 5) * 0.85 * 100) / 100,
    }))
    return {
      id: `mkt-${i + 1}`,
      campaign: `${CAMPAIGN_TYPES[i % CAMPAIGN_TYPES.length]} Campaign ${i + 1}`,
      type: CAMPAIGN_TYPES[i % CAMPAIGN_TYPES.length],
      discount: `${15 + i * 5}% off`,
      skuCount: 3,
      projectedLift: `+${6 + i * 2}% revenue`,
      unlockLevel,
      products,
    }
  })

  const discountTiles: DiscountTile[] = UNLOCK_LEVELS.map((unlockLevel, i) => {
    const products: DiscountTileProduct[] = Array.from({ length: 3 }, (_, j) => ({
      sku: `SKU-${3000 + i * 3 + j}`,
      productName: `${CATEGORIES[(i + j + 2) % CATEGORIES.length]} Clearance ${j + 1}`,
      currentPrice: 29.99 + j * 5,
      discountedPrice: Math.round((29.99 + j * 5) * (0.7 + i * 0.02) * 100) / 100,
    }))
    return {
      id: `disc-${i + 1}`,
      name: `${DISCOUNT_TYPES[i % DISCOUNT_TYPES.length]} Event ${i + 1}`,
      type: DISCOUNT_TYPES[i % DISCOUNT_TYPES.length],
      depth: `${20 + i * 5}–${30 + i * 5}% off`,
      skuCount: 3,
      projectedSellThrough: `${72 + i * 4}%`,
      unlockLevel,
      products,
    }
  })

  return { priceAdjustments, marketingTiles, discountTiles }
}

@Injectable()
export class PriceScenariosService {
  private store: ScenarioEntity[] = []
  private nextId = 1

  constructor(
    private readonly focusSetsService: FocusSetsService,
    private readonly guardrailsService: GuardrailsService,
  ) {}

  findAll(): ScenarioEntity[] {
    return [...this.store].sort((a, b) => b.id - a.id)
  }

  async findOne(id: number): Promise<ScenarioEntity> {
    const s = this.store.find((x) => x.id === id)
    if (!s) throw new NotFoundException(`Scenario ${id} not found`)
    return s
  }

  async create(dto: CreateScenarioDto): Promise<ScenarioEntity> {
    const fs = await this.focusSetsService.findOne(dto.focusGroupId)
    const scenario: ScenarioEntity = {
      id: this.nextId++,
      name: dto.name,
      focusGroupId: dto.focusGroupId,
      focusGroupName: fs.name,
      skuCount: fs.productCount,
      startDate: dto.startDate,
      endDate: dto.endDate,
      objectives: { ...dto.objectives },
      optimizationLevel: dto.optimizationLevel,
      status: "new",
      createdAt: new Date().toISOString(),
      changeRequests: [],
      output: null,
    }
    this.store.push(scenario)
    return scenario
  }

  async run(id: number): Promise<ScenarioEntity> {
    const s = await this.findOne(id)
    s.output = buildOutput(s, this.guardrailsService)
    s.status = "draft"
    return s
  }

  async submit(id: number): Promise<ScenarioEntity> {
    const s = await this.findOne(id)
    if (s.status !== "draft" && s.status !== "returned") {
      throw new BadRequestException(`Cannot submit scenario with status "${s.status}"`)
    }
    s.status = "pending"
    return s
  }

  async updateStatus(id: number, dto: UpdateStatusDto): Promise<ScenarioEntity> {
    const s = await this.findOne(id)
    s.status = dto.status
    if (dto.status === "returned" && dto.comment) {
      const cr: ChangeRequest = {
        requestedAt: new Date().toISOString(),
        comment: dto.comment,
      }
      s.changeRequests.push(cr)
    }
    return s
  }

  async remove(id: number): Promise<void> {
    const idx = this.store.findIndex((x) => x.id === id)
    if (idx === -1) throw new NotFoundException(`Scenario ${id} not found`)
    this.store.splice(idx, 1)
  }

  async getDeepDive(id: number): Promise<DeepDiveOutput> {
    const s = await this.findOne(id)
    if (!s.output) throw new NotFoundException(`Scenario ${id} has no output — run it first`)
    return buildDeepDive(s)
  }
}
