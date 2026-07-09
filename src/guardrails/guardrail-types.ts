/** Tier-1 canonical pricing constraint record. */
export interface GuardrailEntity {
  id: number
  brand: string
  division: string
  rule: string
  op: string
  value: string
  unit: string
  active: boolean
  isOverridable: boolean
}

export interface CreateGuardrailDto {
  brand: string
  division: string
  rule: string
  op: string
  value: string
  unit: string
}

export interface UpdateGuardrailDto {
  brand?: string
  division?: string
  rule?: string
  op?: string
  value?: string
  unit?: string
}

/** Tier-2 per-guardrail evaluation result. */
export interface GuardrailCheckResult {
  id: number
  rule: string
  op: string
  threshold: string
  unit: string
  actual: number
  passed: boolean
  isOverridable: boolean
  severity: "hard" | "advisory"
}

/** Tier-2 evaluation response. */
export interface GuardrailEvaluationResult {
  compliant: boolean
  results: GuardrailCheckResult[]
}

export interface EvaluateDto {
  brand: string
  division: string
  metrics: Record<string, number>
}
