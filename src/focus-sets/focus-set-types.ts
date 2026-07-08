/** Recursive AND/OR condition tree (Tier-2 request shape). */
export type ConditionNode =
  | { type: "rule"; attr: string; val: string }
  | { type: "group"; logic: "AND" | "OR"; rules: ConditionNode[] }

/** Tier-1 canonical Focus Set record (maps to a backend @Entity). Stores the
 * filter tree that resolves to a set of catalog SKUs. Referenced by downstream
 * pricing tools via focusId/focusGroupId FKs in later slices. */
export interface FocusSetEntity {
  id: string
  name: string
  filter: ConditionNode
  createdAt: string
}

/** Tier-2 display projection: entity plus the live-derived product count. */
export interface FocusSetView {
  id: string
  name: string
  filter: ConditionNode
  productCount: number
  createdAt: string
}

/** Tier-2 resolved SKU projection returned by resolution endpoints. */
export interface SkuView {
  sku: string
  name: string
  brand: string
  division: string
  category: string
  price: number
  qty: number
  status: string
}

export interface AttributeOption {
  attr: string
  label: string
  values: string[]
}
