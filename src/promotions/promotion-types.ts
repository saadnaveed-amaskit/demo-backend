/** Tier-1 canonical pricing promotion (Open Q2 resolved — see contract). */
export interface PromotionEntity {
  id: number
  name: string
  startDate: string
  endDate: string
  discountType: "percentage" | "flat"
  discountValue: number
  focusSetId: string
  channel: string
  color: string
  notes: string
  status: "active" | "scheduled" | "expired"
}

export interface CreatePromotionDto {
  name: string
  startDate: string
  endDate: string
  discountType: "percentage" | "flat"
  discountValue: number
  focusSetId: string
  channel: string
  color: string
  notes?: string
}

export interface UpdatePromotionDto {
  name?: string
  startDate?: string
  endDate?: string
  discountType?: "percentage" | "flat"
  discountValue?: number
  focusSetId?: string
  channel?: string
  color?: string
  notes?: string
}

/** Tier-2 per-SKU view inside a promotion's products list. */
export interface PromoProductRow {
  sku: string
  name: string
  brand: string
  price: number
  promoPrice: number
  savings: number
}

/** Tier-2 response for GET /promotions/:id/products. */
export interface PromoProductsView {
  promotionId: number
  promotionName: string
  discountType: "percentage" | "flat"
  discountValue: number
  focusSetId: string
  focusSetName: string
  skus: PromoProductRow[]
}

export function deriveStatus(
  startDate: string,
  endDate: string,
  today: string,
): "active" | "scheduled" | "expired" {
  if (endDate < today) return "expired"
  if (startDate > today) return "scheduled"
  return "active"
}

export function computePromoPrice(
  price: number,
  discountType: "percentage" | "flat",
  discountValue: number,
): number {
  const raw =
    discountType === "percentage"
      ? price * (1 - discountValue / 100)
      : price - discountValue
  return Math.round(Math.max(0, raw) * 100) / 100
}
