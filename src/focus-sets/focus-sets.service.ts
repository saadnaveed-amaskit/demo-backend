import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common"
import { CATALOG_SKUS } from "../catalog/catalog-data"
import { conditionDepth, matchesSku, MAX_CONDITION_DEPTH } from "./condition"
import {
  ConditionNode,
  FocusSetEntity,
  FocusSetView,
  SkuView,
} from "./focus-set-types"

interface FocusSetInput {
  name: string
  filter: ConditionNode
}

@Injectable()
export class FocusSetsService {
  private readonly store = new Map<string, FocusSetEntity>()
  private seq = 0

  private nextId(): string {
    this.seq += 1
    return `focus-set-${String(this.seq).padStart(2, "0")}`
  }

  private toSkuView = (): SkuView[] =>
    CATALOG_SKUS.map((s) => ({
      sku: s.sku,
      name: s.name,
      brand: s.brand,
      division: s.division,
      category: s.category,
      price: s.price,
      qty: s.qty,
      status: s.status,
    }))

  private validate(input: FocusSetInput): void {
    if (!input.name || !input.name.trim()) {
      throw new BadRequestException("name is required")
    }
    if (!input.filter || input.filter.type !== "group") {
      throw new BadRequestException("filter must be a root group")
    }
    if (conditionDepth(input.filter) > MAX_CONDITION_DEPTH) {
      throw new BadRequestException(
        `condition tree exceeds ${MAX_CONDITION_DEPTH} levels`,
      )
    }
  }

  resolve(filter: ConditionNode): { count: number; skus: SkuView[] } {
    const views = this.toSkuView()
    const matched = CATALOG_SKUS.map((sku, i) => ({ sku, view: views[i] }))
      .filter(({ sku }) => matchesSku(sku, filter))
      .map(({ view }) => view)
    return { count: matched.length, skus: matched }
  }

  private toView(entity: FocusSetEntity): FocusSetView {
    return {
      id: entity.id,
      name: entity.name,
      filter: entity.filter,
      createdAt: entity.createdAt,
      productCount: this.resolve(entity.filter).count,
    }
  }

  findAll(): FocusSetView[] {
    return [...this.store.values()].map((e) => this.toView(e))
  }

  findOne(id: string): FocusSetView {
    const entity = this.store.get(id)
    if (!entity) throw new NotFoundException(`focus set ${id} not found`)
    return this.toView(entity)
  }

  create(input: FocusSetInput, createdAt = new Date(0).toISOString()): FocusSetView {
    this.validate(input)
    const entity: FocusSetEntity = {
      id: this.nextId(),
      name: input.name.trim(),
      filter: input.filter,
      createdAt,
    }
    this.store.set(entity.id, entity)
    return this.toView(entity)
  }

  update(id: string, input: FocusSetInput): FocusSetView {
    const existing = this.store.get(id)
    if (!existing) throw new NotFoundException(`focus set ${id} not found`)
    this.validate(input)
    const updated: FocusSetEntity = {
      ...existing,
      name: input.name.trim(),
      filter: input.filter,
    }
    this.store.set(id, updated)
    return this.toView(updated)
  }

  duplicate(id: string, name: string): FocusSetView {
    const existing = this.store.get(id)
    if (!existing) throw new NotFoundException(`focus set ${id} not found`)
    return this.create({ name, filter: existing.filter }, existing.createdAt)
  }

  remove(id: string): boolean {
    if (!this.store.has(id)) throw new NotFoundException(`focus set ${id} not found`)
    return this.store.delete(id)
  }

  resolveById(id: string): { count: number; skus: SkuView[] } {
    const entity = this.store.get(id)
    if (!entity) throw new NotFoundException(`focus set ${id} not found`)
    return this.resolve(entity.filter)
  }
}
