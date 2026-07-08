import { CatalogSku } from "../catalog/catalog-data"
import { ConditionNode } from "./focus-set-types"

export const MAX_CONDITION_DEPTH = 3

/** Depth of a condition tree (root group = depth 1). Used to enforce the
 * 3-level nesting limit (REQ-FOCUS-003). */
export function conditionDepth(node: ConditionNode, level = 1): number {
  if (node.type === "rule") return level
  if (node.rules.length === 0) return level
  return Math.max(...node.rules.map((r) => conditionDepth(r, level + 1)))
}

/** Exact per-attribute equality matcher (REQ-FOCUS-010). An empty root group
 * matches everything. No range/contains/wildcard operators. */
export function matchesSku(sku: CatalogSku, node: ConditionNode): boolean {
  if (node.type === "rule") {
    return String((sku as unknown as Record<string, unknown>)[node.attr]) === node.val
  }
  if (node.rules.length === 0) return true
  return node.logic === "AND"
    ? node.rules.every((r) => matchesSku(sku, r))
    : node.rules.some((r) => matchesSku(sku, r))
}
