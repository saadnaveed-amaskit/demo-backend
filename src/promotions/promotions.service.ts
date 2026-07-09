import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common"
import { FocusSetsService } from "../focus-sets/focus-sets.service"
import { CATALOG_SKUS } from "../catalog/catalog-data"
import { matchesSku } from "../focus-sets/condition"
import {
  computePromoPrice,
  CreatePromotionDto,
  deriveStatus,
  PromoProductRow,
  PromoProductsView,
  PromotionEntity,
  UpdatePromotionDto,
} from "./promotion-types"

@Injectable()
export class PromotionsService {
  private store: Omit<PromotionEntity, "status">[] = []
  private nextId = 1

  constructor(private readonly focusSetsService: FocusSetsService) {}

  private today(): string {
    return new Date().toISOString().slice(0, 10)
  }

  private withStatus(p: Omit<PromotionEntity, "status">): PromotionEntity {
    return { ...p, status: deriveStatus(p.startDate, p.endDate, this.today()) }
  }

  findAll(): PromotionEntity[] {
    return this.store.map((p) => this.withStatus(p))
  }

  findOne(id: number): PromotionEntity | undefined {
    const p = this.store.find((x) => x.id === id)
    return p ? this.withStatus(p) : undefined
  }

  create(dto: CreatePromotionDto): PromotionEntity {
    if (dto.endDate <= dto.startDate) {
      throw new BadRequestException("End date must be strictly after start date")
    }
    const entity: Omit<PromotionEntity, "status"> = {
      id: this.nextId++,
      name: dto.name,
      startDate: dto.startDate,
      endDate: dto.endDate,
      discountType: dto.discountType,
      discountValue: dto.discountValue,
      focusSetId: dto.focusSetId ?? "",
      channel: dto.channel,
      color: dto.color,
      notes: dto.notes ?? "",
    }
    this.store.push(entity)
    return this.withStatus(entity)
  }

  update(id: number, dto: UpdatePromotionDto): PromotionEntity {
    const p = this.store.find((x) => x.id === id)
    if (!p) throw new NotFoundException(`Promotion ${id} not found`)
    if (dto.name !== undefined) p.name = dto.name
    if (dto.startDate !== undefined) p.startDate = dto.startDate
    if (dto.endDate !== undefined) p.endDate = dto.endDate
    if (dto.discountType !== undefined) p.discountType = dto.discountType
    if (dto.discountValue !== undefined) p.discountValue = dto.discountValue
    if (dto.focusSetId !== undefined) p.focusSetId = dto.focusSetId
    if (dto.channel !== undefined) p.channel = dto.channel
    if (dto.color !== undefined) p.color = dto.color
    if (dto.notes !== undefined) p.notes = dto.notes
    const start = p.startDate
    const end = p.endDate
    if (end <= start) {
      throw new BadRequestException("End date must be strictly after start date")
    }
    return this.withStatus(p)
  }

  remove(id: number): void {
    const idx = this.store.findIndex((x) => x.id === id)
    if (idx === -1) throw new NotFoundException(`Promotion ${id} not found`)
    this.store.splice(idx, 1)
  }

  getProducts(id: number): PromoProductsView {
    const promo = this.store.find((x) => x.id === id)
    if (!promo) throw new NotFoundException(`Promotion ${id} not found`)

    const focusSet = this.focusSetsService.findOne(promo.focusSetId)
    if (!focusSet) throw new NotFoundException(`Focus set ${promo.focusSetId} not found`)

    const matchedSkus = CATALOG_SKUS.filter((s) => matchesSku(s, focusSet.filter)).slice(0, 20)

    const skus: PromoProductRow[] = matchedSkus.map((s) => {
      const promoPrice = computePromoPrice(s.price, promo.discountType, promo.discountValue)
      return {
        sku: s.sku,
        name: s.name,
        brand: s.brand,
        price: s.price,
        promoPrice,
        savings: Math.round((s.price - promoPrice) * 100) / 100,
      }
    })

    return {
      promotionId: promo.id,
      promotionName: promo.name,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      focusSetId: promo.focusSetId,
      focusSetName: focusSet.name,
      skus,
    }
  }
}
