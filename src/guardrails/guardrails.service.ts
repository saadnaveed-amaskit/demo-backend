import { Injectable, NotFoundException } from "@nestjs/common"
import type {
  CreateGuardrailDto,
  EvaluateDto,
  GuardrailCheckResult,
  GuardrailEntity,
  GuardrailEvaluationResult,
  UpdateGuardrailDto,
} from "./guardrail-types"

const SEED: GuardrailEntity[] = [
  {
    id: 1,
    brand: "Gymboree",
    division: "BIG GIRLS",
    rule: "Gross Margin",
    op: ">=",
    value: "38",
    unit: "%",
    active: true,
    isOverridable: true,
  },
  {
    id: 2,
    brand: "TCP",
    division: "BOYS",
    rule: "Min Price",
    op: ">=",
    value: "5.00",
    unit: "$",
    active: true,
    isOverridable: false,
  },
  {
    id: 3,
    brand: "TCP",
    division: "GIRLS",
    rule: "Max Discount",
    op: "<=",
    value: "40",
    unit: "%",
    active: true,
    isOverridable: true,
  },
  {
    id: 4,
    brand: "Gymboree",
    division: "TODDLER GIRLS",
    rule: "Gross Margin",
    op: ">=",
    value: "35",
    unit: "%",
    active: false,
    isOverridable: true,
  },
]

@Injectable()
export class GuardrailsService {
  private store: GuardrailEntity[] = SEED.map((g) => ({ ...g }))
  private nextId = 5

  findAll(): GuardrailEntity[] {
    return this.store
  }

  findOne(id: number): GuardrailEntity | undefined {
    return this.store.find((g) => g.id === id)
  }

  create(dto: CreateGuardrailDto): GuardrailEntity {
    const entity: GuardrailEntity = {
      id: this.nextId++,
      brand: dto.brand,
      division: dto.division,
      rule: dto.rule,
      op: dto.op,
      value: dto.value,
      unit: dto.unit,
      active: true,
      isOverridable: true,
    }
    this.store.push(entity)
    return entity
  }

  update(id: number, dto: UpdateGuardrailDto): GuardrailEntity {
    const g = this.findOne(id)
    if (!g) throw new NotFoundException(`Guardrail ${id} not found`)
    if (dto.brand !== undefined) g.brand = dto.brand
    if (dto.division !== undefined) g.division = dto.division
    if (dto.rule !== undefined) g.rule = dto.rule
    if (dto.op !== undefined) g.op = dto.op
    if (dto.value !== undefined) g.value = dto.value
    if (dto.unit !== undefined) g.unit = dto.unit
    return g
  }

  toggleActive(id: number): GuardrailEntity {
    const g = this.findOne(id)
    if (!g) throw new NotFoundException(`Guardrail ${id} not found`)
    g.active = !g.active
    return g
  }

  toggleOverridable(id: number): GuardrailEntity {
    const g = this.findOne(id)
    if (!g) throw new NotFoundException(`Guardrail ${id} not found`)
    g.isOverridable = !g.isOverridable
    return g
  }

  remove(id: number): void {
    const idx = this.store.findIndex((g) => g.id === id)
    if (idx === -1) throw new NotFoundException(`Guardrail ${id} not found`)
    this.store.splice(idx, 1)
  }

  evaluate(dto: EvaluateDto): GuardrailEvaluationResult {
    const applicable = this.store.filter(
      (g) => g.active && g.brand === dto.brand && g.division === dto.division,
    )

    const results: GuardrailCheckResult[] = applicable.map((g) => {
      const actual = dto.metrics[g.rule] ?? NaN
      const threshold = parseFloat(g.value)
      let passed = false
      if (!isNaN(actual) && !isNaN(threshold)) {
        switch (g.op) {
          case ">=": passed = actual >= threshold; break
          case "<=": passed = actual <= threshold; break
          case ">":  passed = actual >  threshold; break
          case "<":  passed = actual <  threshold; break
          case "=":  passed = actual === threshold; break
        }
      }
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

    return {
      compliant: results.every((r) => r.passed),
      results,
    }
  }
}
