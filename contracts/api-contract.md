# API Contract

## Source

| Field | Value |
|---|---|
| Source YAML | `backend/contracts/api-contract.yaml` |
| Generated Markdown | `backend/contracts/api-contract.md` |
| Backend branch | `agent/slice-09-approvals-queue` |
| Backend commit SHA | `f1929644a50336625a1fef46a88a49508f095c6a` |

## Contract Rules

- This Markdown file describes the backend API contract.
- The structured source is `backend/contracts/api-contract.yaml`.
- API behavior must not drift between backend code, tests, YAML contract, and this Markdown contract.
- Update this document whenever backend API behavior changes.

## Endpoint Index

| Method | Path | Summary | Tags |
|---|---|---|---|
| GET | `/approvals/decided` | List price scenarios and discount models that have been decided | approvals |
| POST | `/approvals/discounts/{id}/decision` | Approve, deny, or request changes on a pending discount model | approvals |
| GET | `/approvals/discounts/{id}/review` | Get the discount model's risk banner and impact for approval-mode review | approvals |
| GET | `/approvals/queue` | List pending price scenarios and discount models awaiting decision | approvals |
| POST | `/approvals/scenarios/{id}/decision` | Approve, deny, or request changes on a pending price scenario | approvals |
| GET | `/approvals/scenarios/{id}/review` | Get the full scenario output for approval-mode review | approvals |
| GET | `/catalog/attributes` | List filterable catalog attributes and their observed values | catalog |
| GET | `/discount-models` | List all discount models, newest id first | discount-models |
| POST | `/discount-models` | Create a discount model | discount-models |
| DELETE | `/discount-models/{id}` | Delete a discount model | discount-models |
| GET | `/discount-models/{id}` | Get a discount model by id | discount-models |
| POST | `/discount-models/{id}/run` | Run the discount model and populate its output | discount-models |
| PATCH | `/discount-models/{id}/status` | Force-set a discount model's status | discount-models |
| POST | `/discount-models/{id}/submit` | Submit a discount model for approval | discount-models |
| GET | `/focus-sets` | List all focus sets | focus-sets |
| POST | `/focus-sets` | Create a focus set | focus-sets |
| POST | `/focus-sets/resolve` | Preview SKUs matched by an ad-hoc (unsaved) filter tree | focus-sets |
| DELETE | `/focus-sets/{id}` | Delete a focus set | focus-sets |
| GET | `/focus-sets/{id}` | Get a focus set by id | focus-sets |
| PUT | `/focus-sets/{id}` | Update a focus set (name and/or filter) | focus-sets |
| POST | `/focus-sets/{id}/duplicate` | Duplicate a focus set under a new name | focus-sets |
| GET | `/focus-sets/{id}/skus` | Resolve the SKUs currently matched by a saved focus set's filter | focus-sets |
| GET | `/guardrails` | List all guardrails | guardrails |
| POST | `/guardrails` | Create a guardrail | guardrails |
| POST | `/guardrails/evaluate` | Evaluate metrics against active guardrails for a brand/division | guardrails |
| DELETE | `/guardrails/{id}` | Delete a guardrail | guardrails |
| PATCH | `/guardrails/{id}` | Partially update a guardrail | guardrails |
| PATCH | `/guardrails/{id}/active` | Toggle a guardrail's active flag | guardrails |
| PATCH | `/guardrails/{id}/overridable` | Toggle a guardrail's isOverridable flag | guardrails |
| GET | `/health` | Liveness check | health |
| GET | `/price-scenarios` | List all price scenarios, newest id first | price-scenarios |
| POST | `/price-scenarios` | Create a price scenario | price-scenarios |
| DELETE | `/price-scenarios/{id}` | Delete a price scenario | price-scenarios |
| GET | `/price-scenarios/{id}` | Get a price scenario by id | price-scenarios |
| GET | `/price-scenarios/{id}/deep-dive` | Get the deep-dive breakdown for a scenario that has been run | price-scenarios |
| POST | `/price-scenarios/{id}/run` | Run the price scenario and populate its output | price-scenarios |
| PATCH | `/price-scenarios/{id}/status` | Force-set a price scenario's status | price-scenarios |
| POST | `/price-scenarios/{id}/submit` | Submit a price scenario for approval | price-scenarios |
| GET | `/product-grid/{focusSetId}` | Get the product grid derived from a saved focus set's filter | product-grid |
| POST | `/product-grid/{focusSetId}/exclude` | Mark a SKU as excluded within a focus set's grid | product-grid |
| DELETE | `/product-grid/{focusSetId}/exclusions` | Restore (un-exclude) all SKUs for a focus set | product-grid |
| DELETE | `/product-grid/{focusSetId}/exclusions/{skuId}` | Restore (un-exclude) a single SKU | product-grid |
| GET | `/promotions` | List all promotions | promotions |
| POST | `/promotions` | Create a promotion | promotions |
| DELETE | `/promotions/{id}` | Delete a promotion | promotions |
| PATCH | `/promotions/{id}` | Partially update a promotion | promotions |
| GET | `/promotions/{id}/products` | Get the (discounted) product rows for a promotion | promotions |

## Endpoints

### `GET /approvals/decided`

Summary: List price scenarios and discount models that have been decided

Description: Same aggregation as /approvals/queue, filtered to status in ("approved", "denied", "returned") — i.e. everything except "pending", "new", and "draft".

Tags: approvals

Backend operationId: `getApprovalsDecided`

#### Request

##### Path Parameters

[NOT SPECIFIED]

##### Query Parameters

[NOT SPECIFIED]

##### Headers

[NOT SPECIFIED]

##### Request Body

Content type: [NOT SPECIFIED]

Schema:

[NOT SPECIFIED] (no request body for this endpoint)

Notes: [NOT SPECIFIED]

#### Responses

##### `200`

Description: OK

Content type: application/json

Schema:

`ApprovalsDecidedView`

Example (generated from schema):

```json
{
  "scenarios": [
    {
      "domain": "scenario",
      "id": 0,
      "name": "string",
      "submitter": "string",
      "team": "string",
      "brand": "string",
      "division": "string",
      "impact": "string",
      "risk": "Low",
      "status": "pending",
      "changeRequests": [
        null
      ]
    }
  ],
  "discounts": [
    {
      "domain": "scenario",
      "id": 0,
      "name": "string",
      "submitter": "string",
      "team": "string",
      "brand": "string",
      "division": "string",
      "impact": "string",
      "risk": "Low",
      "status": "pending",
      "changeRequests": [
        null
      ]
    }
  ]
}
```

##### Error Responses

[NOT SPECIFIED] (no documented error responses for this endpoint)

#### Validation / Constraints

[NOT SPECIFIED]

#### Related Schemas

`ApprovalItemView`, `ApprovalsDecidedView`, `ChangeRequest`

### `POST /approvals/discounts/{id}/decision`

Summary: Approve, deny, or request changes on a pending discount model

Description: Same action-to-status mapping and reason-required policy as the scenario decision endpoint. x-note: DiscountModelEntity (SLICE-06) has NO changeRequests field (unlike ScenarioEntity) — the discount's change-request/comment history shown in ApprovalItemView.changeRequests is derived entirely from ApprovalsService's own in-memory decision log filtered to action === "request_changes", NOT from the underlying entity. This history is lost on process restart and is a workaround specific to this endpoint, not a SLICE-06 contract change.

Tags: approvals

Backend operationId: `decideApprovalDiscount`

#### Request

##### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| id | integer | Yes | Discount model id, parsed via ParseIntPipe (400 if non-numeric). |

##### Query Parameters

[NOT SPECIFIED]

##### Headers

[NOT SPECIFIED]

##### Request Body

Content type: application/json

Schema:

`DecisionDto`

Example (generated from schema):

```json
{
  "action": "approve",
  "comment": "string"
}
```

Notes: Request body is required.

#### Responses

##### `200`

Description: OK

Content type: application/json

Schema:

`ApprovalItemView`

Example (generated from schema):

```json
{
  "domain": "scenario",
  "id": 0,
  "name": "string",
  "submitter": "string",
  "team": "string",
  "brand": "string",
  "division": "string",
  "impact": "string",
  "risk": "Low",
  "status": "pending",
  "changeRequests": [
    {
      "requestedAt": "2026-08-01T00:00:00.000Z",
      "comment": "string"
    }
  ]
}
```

##### Error Responses

**`400`**

Description: Non-numeric id, OR comment missing/blank for a non-"approve" action (checked first, before the id lookup).

Schema: `ErrorResponse`

Example (generated from schema):

```json
{
  "statusCode": 0,
  "message": "string",
  "error": "string"
}
```

**`404`**

Description: Resource not found.

Schema: `ErrorResponse`

Example (generated from schema):

```json
{
  "statusCode": 0,
  "message": "string",
  "error": "string"
}
```

#### Validation / Constraints

- Required request body fields: `action`
- `action` enum: approve, deny, request_changes

#### Related Schemas

`ApprovalItemView`, `ChangeRequest`, `DecisionDto`, `ErrorResponse`

### `GET /approvals/discounts/{id}/review`

Summary: Get the discount model's risk banner and impact for approval-mode review

Description: Deliberately omits an itemized guardrail-compliance list and SKU-level price breakdown (unlike the scenario review) per REQ-APPR-009. competitiveFlags is always an empty array in v1 — no competitive-price integration exists. constraintWarnings and riskBanner.advisoryCount both use `severity !== "low"` as the signal for a discount model's RiskPanel[]; riskBanner.hardCount uses `isHard === true` instead — a panel can be isHard:true with severity:"low" (e.g. Margin Risk at low discount depth), in which case it is counted in hardCount but NOT in advisoryCount or constraintWarnings.

Tags: approvals

Backend operationId: `getApprovalDiscountReview`

#### Request

##### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| id | integer | Yes | Discount model id, parsed via ParseIntPipe (400 if non-numeric). |

##### Query Parameters

[NOT SPECIFIED]

##### Headers

[NOT SPECIFIED]

##### Request Body

Content type: [NOT SPECIFIED]

Schema:

[NOT SPECIFIED] (no request body for this endpoint)

Notes: [NOT SPECIFIED]

#### Responses

##### `200`

Description: OK

Content type: application/json

Schema:

`DiscountReviewView`

Example (generated from schema):

```json
{
  "domain": "scenario",
  "id": 0,
  "name": "string",
  "submitter": "string",
  "team": "string",
  "brand": "string",
  "division": "string",
  "impact": "string",
  "risk": "Low",
  "status": "pending",
  "changeRequests": [
    {
      "requestedAt": null,
      "comment": null
    }
  ],
  "riskBanner": {
    "hardCount": 0,
    "advisoryCount": 0
  },
  "constraintWarnings": [
    "string"
  ],
  "competitiveFlags": [
    "string"
  ]
}
```

##### Error Responses

**`400`**

Description: The :id path parameter could not be parsed as an integer.

Schema: `ErrorResponse`

Example (generated from schema):

```json
{
  "statusCode": 0,
  "message": "string",
  "error": "string"
}
```

**`404`**

Description: Discount model id unknown, OR the model exists but has not been run yet (output is null). Both cases return 404, distinguished only by message text.

Schema: `ErrorResponse`

Example (generated from schema):

```json
{
  "statusCode": 0,
  "message": "string",
  "error": "string"
}
```

#### Validation / Constraints

[NOT SPECIFIED]

#### Related Schemas

`ApprovalItemView`, `ChangeRequest`, `DiscountReviewView`, `DiscountRiskBanner`, `ErrorResponse`

### `GET /approvals/queue`

Summary: List pending price scenarios and discount models awaiting decision

Description: Aggregated on every read from PriceScenariosService.findAll() and DiscountModelingService.findAll(), filtered to status === "pending". Not persisted — there is no separate Approvals-owned store for queue membership. submitter/team/brand/division on each item are v1 deterministic placeholders rotated by id (SUBMITTER_ROSTER, 3 entries, `id % 3`), NOT real submitter identity — no identity-provider integration exists.

Tags: approvals

Backend operationId: `getApprovalsQueue`

#### Request

##### Path Parameters

[NOT SPECIFIED]

##### Query Parameters

[NOT SPECIFIED]

##### Headers

[NOT SPECIFIED]

##### Request Body

Content type: [NOT SPECIFIED]

Schema:

[NOT SPECIFIED] (no request body for this endpoint)

Notes: [NOT SPECIFIED]

#### Responses

##### `200`

Description: OK

Content type: application/json

Schema:

`ApprovalsQueueView`

Example (generated from schema):

```json
{
  "scenarios": [
    {
      "domain": "scenario",
      "id": 0,
      "name": "string",
      "submitter": "string",
      "team": "string",
      "brand": "string",
      "division": "string",
      "impact": "string",
      "risk": "Low",
      "status": "pending",
      "changeRequests": [
        null
      ]
    }
  ],
  "discounts": [
    {
      "domain": "scenario",
      "id": 0,
      "name": "string",
      "submitter": "string",
      "team": "string",
      "brand": "string",
      "division": "string",
      "impact": "string",
      "risk": "Low",
      "status": "pending",
      "changeRequests": [
        null
      ]
    }
  ],
  "scenarioPendingCount": 0,
  "discountPendingCount": 0
}
```

##### Error Responses

[NOT SPECIFIED] (no documented error responses for this endpoint)

#### Validation / Constraints

[NOT SPECIFIED]

#### Related Schemas

`ApprovalItemView`, `ApprovalsQueueView`, `ChangeRequest`

### `POST /approvals/scenarios/{id}/decision`

Summary: Approve, deny, or request changes on a pending price scenario

Description: Maps action to the underlying SLICE-07 status machine: "approve" -> "approved", "deny" -> "denied", anything else (including "request_changes" AND any unrecognized string) -> "returned". x-note: action is a plain TS union with ZERO runtime enum validation — mapActionToStatus falls through to "returned" for any value that isn't exactly "approve" or "deny". comment validation runs BEFORE the underlying id lookup, so an invalid id combined with a missing comment yields 400, not 404. One consistent reason-required policy (REQ-APPR-012, resolved 2026-07-09): comment must be non-empty after trim() for every action except "approve"; enforced only server-side here (the frontend additionally disables the confirm button client-side). The deny reason itself is NOT persisted on ScenarioEntity — it is recorded only in ApprovalsService's in-memory decision log (process-wide, not exposed via any GET endpoint) and is lost on process restart. Only "request_changes" (mapped to "returned") appends to ScenarioEntity.changeRequests, matching SLICE-07's existing updateStatus behavior.

Tags: approvals

Backend operationId: `decideApprovalScenario`

#### Request

##### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| id | integer | Yes | Price scenario id, parsed via ParseIntPipe (400 if non-numeric). |

##### Query Parameters

[NOT SPECIFIED]

##### Headers

[NOT SPECIFIED]

##### Request Body

Content type: application/json

Schema:

`DecisionDto`

Example (generated from schema):

```json
{
  "action": "approve",
  "comment": "string"
}
```

Notes: Request body is required.

#### Responses

##### `200`

Description: OK

Content type: application/json

Schema:

`ApprovalItemView`

Example (generated from schema):

```json
{
  "domain": "scenario",
  "id": 0,
  "name": "string",
  "submitter": "string",
  "team": "string",
  "brand": "string",
  "division": "string",
  "impact": "string",
  "risk": "Low",
  "status": "pending",
  "changeRequests": [
    {
      "requestedAt": "2026-08-01T00:00:00.000Z",
      "comment": "string"
    }
  ]
}
```

##### Error Responses

**`400`**

Description: Non-numeric id, OR comment missing/blank for a non-"approve" action (checked first, before the id lookup).

Schema: `ErrorResponse`

Example (generated from schema):

```json
{
  "statusCode": 0,
  "message": "string",
  "error": "string"
}
```

**`404`**

Description: Resource not found.

Schema: `ErrorResponse`

Example (generated from schema):

```json
{
  "statusCode": 0,
  "message": "string",
  "error": "string"
}
```

#### Validation / Constraints

- Required request body fields: `action`
- `action` enum: approve, deny, request_changes

#### Related Schemas

`ApprovalItemView`, `ChangeRequest`, `DecisionDto`, `ErrorResponse`

### `GET /approvals/scenarios/{id}/review`

Summary: Get the full scenario output for approval-mode review

Description: Reuses ScenarioEntity.output from SLICE-07 as-is (no separate Approvals-owned review record). x-note: mirrors the /price-scenarios/{id}/deep-dive 404 ambiguity — scenario id unknown and scenario-exists-but-not-yet-run (output is null) BOTH return 404, distinguished only by message text.

Tags: approvals

Backend operationId: `getApprovalScenarioReview`

#### Request

##### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| id | integer | Yes | Price scenario id, parsed via ParseIntPipe (400 if non-numeric). |

##### Query Parameters

[NOT SPECIFIED]

##### Headers

[NOT SPECIFIED]

##### Request Body

Content type: [NOT SPECIFIED]

Schema:

[NOT SPECIFIED] (no request body for this endpoint)

Notes: [NOT SPECIFIED]

#### Responses

##### `200`

Description: OK

Content type: application/json

Schema:

`ScenarioReviewView`

Example (generated from schema):

```json
{
  "domain": "scenario",
  "id": 0,
  "name": "string",
  "submitter": "string",
  "team": "string",
  "brand": "string",
  "division": "string",
  "impact": "string",
  "risk": "Low",
  "status": "pending",
  "changeRequests": [
    {
      "requestedAt": null,
      "comment": null
    }
  ],
  "output": {
    "narrative": "string",
    "uncertainty": "string",
    "guardrailResults": [
      null
    ],
    "comparison": [
      null
    ],
    "frontier": [
      null
    ],
    "currentPoint": {
      "level": null,
      "revenue": null,
      "profit": null
    },
    "mlRecPoint": {
      "level": null,
      "revenue": null,
      "profit": null
    },
    "scenarioPoint": {
      "level": null,
      "revenue": null,
      "profit": null
    },
    "recommendations": [
      null
    ]
  }
}
```

##### Error Responses

**`400`**

Description: The :id path parameter could not be parsed as an integer.

Schema: `ErrorResponse`

Example (generated from schema):

```json
{
  "statusCode": 0,
  "message": "string",
  "error": "string"
}
```

**`404`**

Description: Resource not found.

Schema: `ErrorResponse`

Example (generated from schema):

```json
{
  "statusCode": 0,
  "message": "string",
  "error": "string"
}
```

#### Validation / Constraints

[NOT SPECIFIED]

#### Related Schemas

`ApprovalItemView`, `ChangeRequest`, `ComparisonRow`, `ErrorResponse`, `FrontierPoint`, `Recommendation`, `ScenarioGuardrailCheck`, `ScenarioOutput`, `ScenarioReviewView`

### `GET /catalog/attributes`

Summary: List filterable catalog attributes and their observed values

Description: Derived from a fixed list of 9 filterable attributes (brand, division, department, category, subClass, masterSeason, seasonCode, bigIdea, status), each populated with the distinct, sorted values present in the in-memory catalog seed data.

Tags: catalog

Backend operationId: `getCatalogAttributes`

#### Request

##### Path Parameters

[NOT SPECIFIED]

##### Query Parameters

[NOT SPECIFIED]

##### Headers

[NOT SPECIFIED]

##### Request Body

Content type: [NOT SPECIFIED]

Schema:

[NOT SPECIFIED] (no request body for this endpoint)

Notes: [NOT SPECIFIED]

#### Responses

##### `200`

Description: OK

Content type: application/json

Schema:

array of `AttributeOption`

Example (generated from schema):

```json
[
  {
    "attr": "string",
    "label": "string",
    "values": [
      "string"
    ]
  }
]
```

##### Error Responses

[NOT SPECIFIED] (no documented error responses for this endpoint)

#### Validation / Constraints

[NOT SPECIFIED]

#### Related Schemas

`AttributeOption`

### `GET /discount-models`

Summary: List all discount models, newest id first

Description: [NOT SPECIFIED]

Tags: discount-models

Backend operationId: `listDiscountModels`

#### Request

##### Path Parameters

[NOT SPECIFIED]

##### Query Parameters

[NOT SPECIFIED]

##### Headers

[NOT SPECIFIED]

##### Request Body

Content type: [NOT SPECIFIED]

Schema:

[NOT SPECIFIED] (no request body for this endpoint)

Notes: [NOT SPECIFIED]

#### Responses

##### `200`

Description: OK

Content type: application/json

Schema:

array of `DiscountModelEntity`

Example (generated from schema):

```json
[
  {
    "id": 0,
    "name": "string",
    "focusGroupId": "string",
    "focusGroupName": "string",
    "skuCount": 0,
    "startDate": "2026-08-01",
    "endDate": "2026-08-01",
    "discountFormat": "percentage",
    "discountDepth": 0,
    "channel": "string",
    "status": "new",
    "createdAt": "2026-08-01T00:00:00.000Z",
    "marketingHandle": "string",
    "output": {
      "narrative": "string",
      "marketingHandle": "string",
      "kpis": null,
      "forecastRevenue": [
        null
      ],
      "forecastMargin": [
        null
      ],
      "forecastUnits": [
        null
      ],
      "rollupRows": [
        null
      ],
      "riskPanels": [
        null
      ]
    }
  }
]
```

##### Error Responses

[NOT SPECIFIED] (no documented error responses for this endpoint)

#### Validation / Constraints

[NOT SPECIFIED]

#### Related Schemas

`DiscountModelEntity`, `DiscountModelKpis`, `DiscountModelOutput`, `NivoBarDatapoint`, `NivoLineDatapoint`, `NivoLineDataset`, `RiskPanel`, `RollupRow`

### `POST /discount-models`

Summary: Create a discount model

Description: x-note: If focusGroupId is truthy but does not resolve to an existing focus set, the resulting NotFoundException is SWALLOWED internally (try/catch) — focusGroupName/skuCount simply stay at defaults ("" / 0) rather than the request failing. This is asymmetric with price-scenarios' create, which propagates the same lookup failure as a 404.

Tags: discount-models

Backend operationId: `createDiscountModel`

#### Request

##### Path Parameters

[NOT SPECIFIED]

##### Query Parameters

[NOT SPECIFIED]

##### Headers

[NOT SPECIFIED]

##### Request Body

Content type: application/json

Schema:

`CreateDiscountModelDto`

Example (generated from schema):

```json
{
  "name": "string",
  "focusGroupId": "string",
  "startDate": "2026-08-01",
  "endDate": "2026-08-01",
  "discountFormat": "percentage",
  "discountDepth": 0,
  "channel": "string"
}
```

Notes: Request body is required.

#### Responses

##### `201`

Description: Created, status is always "new", output is null.

Content type: application/json

Schema:

`DiscountModelEntity`

Example (generated from schema):

```json
{
  "id": 0,
  "name": "string",
  "focusGroupId": "string",
  "focusGroupName": "string",
  "skuCount": 0,
  "startDate": "2026-08-01",
  "endDate": "2026-08-01",
  "discountFormat": "percentage",
  "discountDepth": 0,
  "channel": "string",
  "status": "new",
  "createdAt": "2026-08-01T00:00:00.000Z",
  "marketingHandle": "string",
  "output": {
    "narrative": "string",
    "marketingHandle": "string",
    "kpis": {
      "revenueImpact": null,
      "marginImpact": null,
      "unitLift": null,
      "sellThrough": null,
      "incrementalRevenue": null
    },
    "forecastRevenue": [
      null
    ],
    "forecastMargin": [
      null
    ],
    "forecastUnits": [
      null
    ],
    "rollupRows": [
      null
    ],
    "riskPanels": [
      null
    ]
  }
}
```

##### Error Responses

[NOT SPECIFIED] (no documented error responses for this endpoint)

#### Validation / Constraints

- Required request body fields: `name`, `focusGroupId`, `startDate`, `endDate`, `discountFormat`, `channel`
- `startDate` format: date
- `endDate` format: date
- `discountFormat` enum: percentage, flat, bogo, fixed

#### Related Schemas

`CreateDiscountModelDto`, `DiscountModelEntity`, `DiscountModelKpis`, `DiscountModelOutput`, `NivoBarDatapoint`, `NivoLineDatapoint`, `NivoLineDataset`, `RiskPanel`, `RollupRow`

### `DELETE /discount-models/{id}`

Summary: Delete a discount model

Description: [NOT SPECIFIED]

Tags: discount-models

Backend operationId: `deleteDiscountModel`

#### Request

##### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| id | integer | Yes | Discount model id, parsed via ParseIntPipe (400 if non-numeric). |

##### Query Parameters

[NOT SPECIFIED]

##### Headers

[NOT SPECIFIED]

##### Request Body

Content type: [NOT SPECIFIED]

Schema:

[NOT SPECIFIED] (no request body for this endpoint)

Notes: [NOT SPECIFIED]

#### Responses

##### `204`

Description: Deleted, no content

Content type: [NOT SPECIFIED] (no content)

Schema:

[NOT SPECIFIED]

Example: [NOT SPECIFIED]

##### Error Responses

**`400`**

Description: The :id path parameter could not be parsed as an integer.

Schema: `ErrorResponse`

Example (generated from schema):

```json
{
  "statusCode": 0,
  "message": "string",
  "error": "string"
}
```

**`404`**

Description: Resource not found.

Schema: `ErrorResponse`

Example (generated from schema):

```json
{
  "statusCode": 0,
  "message": "string",
  "error": "string"
}
```

#### Validation / Constraints

[NOT SPECIFIED]

#### Related Schemas

`ErrorResponse`

### `GET /discount-models/{id}`

Summary: Get a discount model by id

Description: [NOT SPECIFIED]

Tags: discount-models

Backend operationId: `getDiscountModel`

#### Request

##### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| id | integer | Yes | Discount model id, parsed via ParseIntPipe (400 if non-numeric). |

##### Query Parameters

[NOT SPECIFIED]

##### Headers

[NOT SPECIFIED]

##### Request Body

Content type: [NOT SPECIFIED]

Schema:

[NOT SPECIFIED] (no request body for this endpoint)

Notes: [NOT SPECIFIED]

#### Responses

##### `200`

Description: OK

Content type: application/json

Schema:

`DiscountModelEntity`

Example (generated from schema):

```json
{
  "id": 0,
  "name": "string",
  "focusGroupId": "string",
  "focusGroupName": "string",
  "skuCount": 0,
  "startDate": "2026-08-01",
  "endDate": "2026-08-01",
  "discountFormat": "percentage",
  "discountDepth": 0,
  "channel": "string",
  "status": "new",
  "createdAt": "2026-08-01T00:00:00.000Z",
  "marketingHandle": "string",
  "output": {
    "narrative": "string",
    "marketingHandle": "string",
    "kpis": {
      "revenueImpact": null,
      "marginImpact": null,
      "unitLift": null,
      "sellThrough": null,
      "incrementalRevenue": null
    },
    "forecastRevenue": [
      null
    ],
    "forecastMargin": [
      null
    ],
    "forecastUnits": [
      null
    ],
    "rollupRows": [
      null
    ],
    "riskPanels": [
      null
    ]
  }
}
```

##### Error Responses

**`400`**

Description: The :id path parameter could not be parsed as an integer.

Schema: `ErrorResponse`

Example (generated from schema):

```json
{
  "statusCode": 0,
  "message": "string",
  "error": "string"
}
```

**`404`**

Description: Resource not found.

Schema: `ErrorResponse`

Example (generated from schema):

```json
{
  "statusCode": 0,
  "message": "string",
  "error": "string"
}
```

#### Validation / Constraints

[NOT SPECIFIED]

#### Related Schemas

`DiscountModelEntity`, `DiscountModelKpis`, `DiscountModelOutput`, `ErrorResponse`, `NivoBarDatapoint`, `NivoLineDatapoint`, `NivoLineDataset`, `RiskPanel`, `RollupRow`

### `POST /discount-models/{id}/run`

Summary: Run the discount model and populate its output

Description: Forces status to "draft" regardless of prior status. Uses `skuCount \|\| 10` as the effective sku count for computation (a model whose linked focus set couldn't be resolved at create time defaults to 10). Deterministic array lengths: rollupRows has 5 entries (one per RN_DIVISIONS division), riskPanels has 6 (one per RISK_TEMPLATES), forecastRevenue/forecastMargin have 2 datasets each ("Baseline"/"Promoted"), forecastUnits has 8 weekly entries. marketingHandle format: `${brand}-${fmt}-${dep}-${channel}-SUMMER-${yyyymm}`.

Tags: discount-models

Backend operationId: `runDiscountModel`

#### Request

##### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| id | integer | Yes | Discount model id, parsed via ParseIntPipe (400 if non-numeric). |

##### Query Parameters

[NOT SPECIFIED]

##### Headers

[NOT SPECIFIED]

##### Request Body

Content type: [NOT SPECIFIED]

Schema:

[NOT SPECIFIED] (no request body for this endpoint)

Notes: [NOT SPECIFIED]

#### Responses

##### `200`

Description: OK (explicit @HttpCode(200))

Content type: application/json

Schema:

`DiscountModelEntity`

Example (generated from schema):

```json
{
  "id": 0,
  "name": "string",
  "focusGroupId": "string",
  "focusGroupName": "string",
  "skuCount": 0,
  "startDate": "2026-08-01",
  "endDate": "2026-08-01",
  "discountFormat": "percentage",
  "discountDepth": 0,
  "channel": "string",
  "status": "new",
  "createdAt": "2026-08-01T00:00:00.000Z",
  "marketingHandle": "string",
  "output": {
    "narrative": "string",
    "marketingHandle": "string",
    "kpis": {
      "revenueImpact": null,
      "marginImpact": null,
      "unitLift": null,
      "sellThrough": null,
      "incrementalRevenue": null
    },
    "forecastRevenue": [
      null
    ],
    "forecastMargin": [
      null
    ],
    "forecastUnits": [
      null
    ],
    "rollupRows": [
      null
    ],
    "riskPanels": [
      null
    ]
  }
}
```

##### Error Responses

**`400`**

Description: The :id path parameter could not be parsed as an integer.

Schema: `ErrorResponse`

Example (generated from schema):

```json
{
  "statusCode": 0,
  "message": "string",
  "error": "string"
}
```

**`404`**

Description: Resource not found.

Schema: `ErrorResponse`

Example (generated from schema):

```json
{
  "statusCode": 0,
  "message": "string",
  "error": "string"
}
```

#### Validation / Constraints

[NOT SPECIFIED]

#### Related Schemas

`DiscountModelEntity`, `DiscountModelKpis`, `DiscountModelOutput`, `ErrorResponse`, `NivoBarDatapoint`, `NivoLineDatapoint`, `NivoLineDataset`, `RiskPanel`, `RollupRow`

### `PATCH /discount-models/{id}/status`

Summary: Force-set a discount model's status

Description: No transition rules are enforced — any string in the request body is assigned as-is (no runtime enum validation), unlike submit's explicit draft-only check.

Tags: discount-models

Backend operationId: `updateDiscountModelStatus`

#### Request

##### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| id | integer | Yes | Discount model id, parsed via ParseIntPipe (400 if non-numeric). |

##### Query Parameters

[NOT SPECIFIED]

##### Headers

[NOT SPECIFIED]

##### Request Body

Content type: application/json

Schema:

`DiscountModelUpdateStatusDto`

Example (generated from schema):

```json
{
  "status": "new"
}
```

Notes: Request body is required.

#### Responses

##### `200`

Description: OK (explicit @HttpCode(200))

Content type: application/json

Schema:

`DiscountModelEntity`

Example (generated from schema):

```json
{
  "id": 0,
  "name": "string",
  "focusGroupId": "string",
  "focusGroupName": "string",
  "skuCount": 0,
  "startDate": "2026-08-01",
  "endDate": "2026-08-01",
  "discountFormat": "percentage",
  "discountDepth": 0,
  "channel": "string",
  "status": "new",
  "createdAt": "2026-08-01T00:00:00.000Z",
  "marketingHandle": "string",
  "output": {
    "narrative": "string",
    "marketingHandle": "string",
    "kpis": {
      "revenueImpact": null,
      "marginImpact": null,
      "unitLift": null,
      "sellThrough": null,
      "incrementalRevenue": null
    },
    "forecastRevenue": [
      null
    ],
    "forecastMargin": [
      null
    ],
    "forecastUnits": [
      null
    ],
    "rollupRows": [
      null
    ],
    "riskPanels": [
      null
    ]
  }
}
```

##### Error Responses

**`400`**

Description: The :id path parameter could not be parsed as an integer.

Schema: `ErrorResponse`

Example (generated from schema):

```json
{
  "statusCode": 0,
  "message": "string",
  "error": "string"
}
```

**`404`**

Description: Resource not found.

Schema: `ErrorResponse`

Example (generated from schema):

```json
{
  "statusCode": 0,
  "message": "string",
  "error": "string"
}
```

#### Validation / Constraints

- Required request body fields: `status`
- `status` enum: new, draft, pending, approved, returned, denied

#### Related Schemas

`DiscountModelEntity`, `DiscountModelKpis`, `DiscountModelOutput`, `DiscountModelUpdateStatusDto`, `ErrorResponse`, `NivoBarDatapoint`, `NivoLineDatapoint`, `NivoLineDataset`, `RiskPanel`, `RollupRow`

### `POST /discount-models/{id}/submit`

Summary: Submit a discount model for approval

Description: Only accepts models currently in status "draft" (i.e. run() must be called first). Unlike price-scenarios' submit, there is NO "returned" resubmit path here.

Tags: discount-models

Backend operationId: `submitDiscountModel`

#### Request

##### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| id | integer | Yes | Discount model id, parsed via ParseIntPipe (400 if non-numeric). |

##### Query Parameters

[NOT SPECIFIED]

##### Headers

[NOT SPECIFIED]

##### Request Body

Content type: [NOT SPECIFIED]

Schema:

[NOT SPECIFIED] (no request body for this endpoint)

Notes: [NOT SPECIFIED]

#### Responses

##### `200`

Description: OK (explicit @HttpCode(200)), status becomes "pending".

Content type: application/json

Schema:

`DiscountModelEntity`

Example (generated from schema):

```json
{
  "id": 0,
  "name": "string",
  "focusGroupId": "string",
  "focusGroupName": "string",
  "skuCount": 0,
  "startDate": "2026-08-01",
  "endDate": "2026-08-01",
  "discountFormat": "percentage",
  "discountDepth": 0,
  "channel": "string",
  "status": "new",
  "createdAt": "2026-08-01T00:00:00.000Z",
  "marketingHandle": "string",
  "output": {
    "narrative": "string",
    "marketingHandle": "string",
    "kpis": {
      "revenueImpact": null,
      "marginImpact": null,
      "unitLift": null,
      "sellThrough": null,
      "incrementalRevenue": null
    },
    "forecastRevenue": [
      null
    ],
    "forecastMargin": [
      null
    ],
    "forecastUnits": [
      null
    ],
    "rollupRows": [
      null
    ],
    "riskPanels": [
      null
    ]
  }
}
```

##### Error Responses

**`400`**

Description: Current status is not "draft".

Schema: `ErrorResponse`

Example (generated from schema):

```json
{
  "statusCode": 0,
  "message": "string",
  "error": "string"
}
```

**`404`**

Description: Resource not found.

Schema: `ErrorResponse`

Example (generated from schema):

```json
{
  "statusCode": 0,
  "message": "string",
  "error": "string"
}
```

#### Validation / Constraints

[NOT SPECIFIED]

#### Related Schemas

`DiscountModelEntity`, `DiscountModelKpis`, `DiscountModelOutput`, `ErrorResponse`, `NivoBarDatapoint`, `NivoLineDatapoint`, `NivoLineDataset`, `RiskPanel`, `RollupRow`

### `GET /focus-sets`

Summary: List all focus sets

Description: [NOT SPECIFIED]

Tags: focus-sets

Backend operationId: `listFocusSets`

#### Request

##### Path Parameters

[NOT SPECIFIED]

##### Query Parameters

[NOT SPECIFIED]

##### Headers

[NOT SPECIFIED]

##### Request Body

Content type: [NOT SPECIFIED]

Schema:

[NOT SPECIFIED] (no request body for this endpoint)

Notes: [NOT SPECIFIED]

#### Responses

##### `200`

Description: OK

Content type: application/json

Schema:

array of `FocusSetView`

Example (generated from schema):

```json
[
  {
    "id": "string",
    "name": "string",
    "filter": {
      "type": null,
      "attr": null,
      "val": null
    },
    "productCount": 0,
    "createdAt": "2026-08-01T00:00:00.000Z"
  }
]
```

##### Error Responses

[NOT SPECIFIED] (no documented error responses for this endpoint)

#### Validation / Constraints

[NOT SPECIFIED]

#### Related Schemas

`ConditionGroupNode`, `ConditionNode`, `ConditionRuleNode`, `FocusSetView`

### `POST /focus-sets`

Summary: Create a focus set

Description: [NOT SPECIFIED]

Tags: focus-sets

Backend operationId: `createFocusSet`

#### Request

##### Path Parameters

[NOT SPECIFIED]

##### Query Parameters

[NOT SPECIFIED]

##### Headers

[NOT SPECIFIED]

##### Request Body

Content type: application/json

Schema:

`FocusSetBody`

Example (generated from schema):

```json
{
  "name": "string",
  "filter": {
    "type": "rule",
    "attr": "string",
    "val": "string"
  }
}
```

Notes: Request body is required.

#### Responses

##### `201`

Description: Created

Content type: application/json

Schema:

`FocusSetView`

Example (generated from schema):

```json
{
  "id": "string",
  "name": "string",
  "filter": {
    "type": "rule",
    "attr": "string",
    "val": "string"
  },
  "productCount": 0,
  "createdAt": "2026-08-01T00:00:00.000Z"
}
```

##### Error Responses

**`400`**

Description: name is empty/whitespace-only, filter is missing or its root node is not type "group", or the condition tree exceeds 3 levels of depth (root group = level 1).

Schema: `ErrorResponse`

Example (generated from schema):

```json
{
  "statusCode": 0,
  "message": "string",
  "error": "string"
}
```

#### Validation / Constraints

- Required request body fields: `name`, `filter`

#### Related Schemas

`ConditionGroupNode`, `ConditionNode`, `ConditionRuleNode`, `ErrorResponse`, `FocusSetBody`, `FocusSetView`

### `POST /focus-sets/resolve`

Summary: Preview SKUs matched by an ad-hoc (unsaved) filter tree

Description: Unlike create/update, this endpoint does NOT enforce the "root must be type group" rule or the max-depth-3 rule.

Tags: focus-sets

Backend operationId: `resolveFocusSetPreview`

#### Request

##### Path Parameters

[NOT SPECIFIED]

##### Query Parameters

[NOT SPECIFIED]

##### Headers

[NOT SPECIFIED]

##### Request Body

Content type: application/json

Schema:

object

Example (generated from schema):

```json
{
  "filter": {
    "type": "rule",
    "attr": "string",
    "val": "string"
  }
}
```

Notes: Request body is required.

#### Responses

##### `200`

Description: OK (explicit @HttpCode(200) override of default POST 201)

Content type: application/json

Schema:

`ResolveResult`

Example (generated from schema):

```json
{
  "count": 0,
  "skus": [
    {
      "sku": "string",
      "name": "string",
      "brand": "string",
      "division": "string",
      "category": "string",
      "price": 0,
      "qty": 0,
      "status": "string"
    }
  ]
}
```

##### Error Responses

[NOT SPECIFIED] (no documented error responses for this endpoint)

#### Validation / Constraints

- Required request body fields: `filter`
- x-note: No runtime validation of the request body. A missing `filter` field causes an unhandled TypeError (surfaces as 500), not a clean 400, because no ValidationPipe is registered.

#### Related Schemas

`ConditionGroupNode`, `ConditionNode`, `ConditionRuleNode`, `ResolveResult`, `SkuView`

### `DELETE /focus-sets/{id}`

Summary: Delete a focus set

Description: [NOT SPECIFIED]

Tags: focus-sets

Backend operationId: `deleteFocusSet`

#### Request

##### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| id | string | Yes | Focus set id (plain string, no coercion pipe). |

##### Query Parameters

[NOT SPECIFIED]

##### Headers

[NOT SPECIFIED]

##### Request Body

Content type: [NOT SPECIFIED]

Schema:

[NOT SPECIFIED] (no request body for this endpoint)

Notes: [NOT SPECIFIED]

#### Responses

##### `204`

Description: Deleted, no content

Content type: [NOT SPECIFIED] (no content)

Schema:

[NOT SPECIFIED]

Example: [NOT SPECIFIED]

##### Error Responses

**`404`**

Description: Resource not found.

Schema: `ErrorResponse`

Example (generated from schema):

```json
{
  "statusCode": 0,
  "message": "string",
  "error": "string"
}
```

#### Validation / Constraints

[NOT SPECIFIED]

#### Related Schemas

`ErrorResponse`

### `GET /focus-sets/{id}`

Summary: Get a focus set by id

Description: [NOT SPECIFIED]

Tags: focus-sets

Backend operationId: `getFocusSet`

#### Request

##### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| id | string | Yes | Focus set id (plain string, no coercion pipe). |

##### Query Parameters

[NOT SPECIFIED]

##### Headers

[NOT SPECIFIED]

##### Request Body

Content type: [NOT SPECIFIED]

Schema:

[NOT SPECIFIED] (no request body for this endpoint)

Notes: [NOT SPECIFIED]

#### Responses

##### `200`

Description: OK

Content type: application/json

Schema:

`FocusSetView`

Example (generated from schema):

```json
{
  "id": "string",
  "name": "string",
  "filter": {
    "type": "rule",
    "attr": "string",
    "val": "string"
  },
  "productCount": 0,
  "createdAt": "2026-08-01T00:00:00.000Z"
}
```

##### Error Responses

**`404`**

Description: Resource not found.

Schema: `ErrorResponse`

Example (generated from schema):

```json
{
  "statusCode": 0,
  "message": "string",
  "error": "string"
}
```

#### Validation / Constraints

[NOT SPECIFIED]

#### Related Schemas

`ConditionGroupNode`, `ConditionNode`, `ConditionRuleNode`, `ErrorResponse`, `FocusSetView`

### `PUT /focus-sets/{id}`

Summary: Update a focus set (name and/or filter)

Description: [NOT SPECIFIED]

Tags: focus-sets

Backend operationId: `updateFocusSet`

#### Request

##### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| id | string | Yes | Focus set id (plain string, no coercion pipe). |

##### Query Parameters

[NOT SPECIFIED]

##### Headers

[NOT SPECIFIED]

##### Request Body

Content type: application/json

Schema:

`FocusSetBody`

Example (generated from schema):

```json
{
  "name": "string",
  "filter": {
    "type": "rule",
    "attr": "string",
    "val": "string"
  }
}
```

Notes: Request body is required.

#### Responses

##### `200`

Description: OK

Content type: application/json

Schema:

`FocusSetView`

Example (generated from schema):

```json
{
  "id": "string",
  "name": "string",
  "filter": {
    "type": "rule",
    "attr": "string",
    "val": "string"
  },
  "productCount": 0,
  "createdAt": "2026-08-01T00:00:00.000Z"
}
```

##### Error Responses

**`400`**

Description: Same validation rules as create (name, root-group, max depth 3).

Schema: `ErrorResponse`

Example (generated from schema):

```json
{
  "statusCode": 0,
  "message": "string",
  "error": "string"
}
```

**`404`**

Description: Resource not found.

Schema: `ErrorResponse`

Example (generated from schema):

```json
{
  "statusCode": 0,
  "message": "string",
  "error": "string"
}
```

#### Validation / Constraints

- Required request body fields: `name`, `filter`

#### Related Schemas

`ConditionGroupNode`, `ConditionNode`, `ConditionRuleNode`, `ErrorResponse`, `FocusSetBody`, `FocusSetView`

### `POST /focus-sets/{id}/duplicate`

Summary: Duplicate a focus set under a new name

Description: The new record inherits the source's filter AND its original createdAt timestamp (not the duplication time), because duplicate() copies existing.createdAt through rather than stamping "now".

Tags: focus-sets

Backend operationId: `duplicateFocusSet`

#### Request

##### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| id | string | Yes | Focus set id (plain string, no coercion pipe). |

##### Query Parameters

[NOT SPECIFIED]

##### Headers

[NOT SPECIFIED]

##### Request Body

Content type: application/json

Schema:

object

Example (generated from schema):

```json
{
  "name": "string"
}
```

Notes: Request body is required.

#### Responses

##### `201`

Description: Created (new id, name required non-empty via internal create() call)

Content type: application/json

Schema:

`FocusSetView`

Example (generated from schema):

```json
{
  "id": "string",
  "name": "string",
  "filter": {
    "type": "rule",
    "attr": "string",
    "val": "string"
  },
  "productCount": 0,
  "createdAt": "2026-08-01T00:00:00.000Z"
}
```

##### Error Responses

**`400`**

Description: Empty/whitespace name (validated by the internal create() call).

Schema: `ErrorResponse`

Example (generated from schema):

```json
{
  "statusCode": 0,
  "message": "string",
  "error": "string"
}
```

**`404`**

Description: Resource not found.

Schema: `ErrorResponse`

Example (generated from schema):

```json
{
  "statusCode": 0,
  "message": "string",
  "error": "string"
}
```

#### Validation / Constraints

- Required request body fields: `name`

#### Related Schemas

`ConditionGroupNode`, `ConditionNode`, `ConditionRuleNode`, `ErrorResponse`, `FocusSetView`

### `GET /focus-sets/{id}/skus`

Summary: Resolve the SKUs currently matched by a saved focus set's filter

Description: [NOT SPECIFIED]

Tags: focus-sets

Backend operationId: `getFocusSetSkus`

#### Request

##### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| id | string | Yes | Focus set id (plain string, no coercion pipe). |

##### Query Parameters

[NOT SPECIFIED]

##### Headers

[NOT SPECIFIED]

##### Request Body

Content type: [NOT SPECIFIED]

Schema:

[NOT SPECIFIED] (no request body for this endpoint)

Notes: [NOT SPECIFIED]

#### Responses

##### `200`

Description: OK

Content type: application/json

Schema:

`ResolveResult`

Example (generated from schema):

```json
{
  "count": 0,
  "skus": [
    {
      "sku": "string",
      "name": "string",
      "brand": "string",
      "division": "string",
      "category": "string",
      "price": 0,
      "qty": 0,
      "status": "string"
    }
  ]
}
```

##### Error Responses

**`404`**

Description: Resource not found.

Schema: `ErrorResponse`

Example (generated from schema):

```json
{
  "statusCode": 0,
  "message": "string",
  "error": "string"
}
```

#### Validation / Constraints

[NOT SPECIFIED]

#### Related Schemas

`ErrorResponse`, `ResolveResult`, `SkuView`

### `GET /guardrails`

Summary: List all guardrails

Description: [NOT SPECIFIED]

Tags: guardrails

Backend operationId: `listGuardrails`

#### Request

##### Path Parameters

[NOT SPECIFIED]

##### Query Parameters

[NOT SPECIFIED]

##### Headers

[NOT SPECIFIED]

##### Request Body

Content type: [NOT SPECIFIED]

Schema:

[NOT SPECIFIED] (no request body for this endpoint)

Notes: [NOT SPECIFIED]

#### Responses

##### `200`

Description: OK

Content type: application/json

Schema:

array of `GuardrailEntity`

Example (generated from schema):

```json
[
  {
    "id": 0,
    "brand": "string",
    "division": "string",
    "rule": "string",
    "op": "string",
    "value": "string",
    "unit": "string",
    "active": false,
    "isOverridable": false
  }
]
```

##### Error Responses

[NOT SPECIFIED] (no documented error responses for this endpoint)

#### Validation / Constraints

[NOT SPECIFIED]

#### Related Schemas

`GuardrailEntity`

### `POST /guardrails`

Summary: Create a guardrail

Description: Server forces active=true and isOverridable=true on creation regardless of request body (CreateGuardrailDto has no such fields).

Tags: guardrails

Backend operationId: `createGuardrail`

#### Request

##### Path Parameters

[NOT SPECIFIED]

##### Query Parameters

[NOT SPECIFIED]

##### Headers

[NOT SPECIFIED]

##### Request Body

Content type: application/json

Schema:

`CreateGuardrailDto`

Example (generated from schema):

```json
{
  "brand": "string",
  "division": "string",
  "rule": "string",
  "op": "string",
  "value": "string",
  "unit": "string"
}
```

Notes: Request body is required.

#### Responses

##### `201`

Description: Created

Content type: application/json

Schema:

`GuardrailEntity`

Example (generated from schema):

```json
{
  "id": 0,
  "brand": "string",
  "division": "string",
  "rule": "string",
  "op": "string",
  "value": "string",
  "unit": "string",
  "active": false,
  "isOverridable": false
}
```

##### Error Responses

[NOT SPECIFIED] (no documented error responses for this endpoint)

#### Validation / Constraints

- Required request body fields: `brand`, `division`, `rule`, `op`, `value`, `unit`

#### Related Schemas

`CreateGuardrailDto`, `GuardrailEntity`

### `POST /guardrails/evaluate`

Summary: Evaluate metrics against active guardrails for a brand/division

Description: Only ACTIVE guardrails matching brand+division exactly are evaluated. If a metric named by a guardrail's `rule` is missing from `metrics`, `actual` is NaN and `passed` is false.

Tags: guardrails

Backend operationId: `evaluateGuardrails`

#### Request

##### Path Parameters

[NOT SPECIFIED]

##### Query Parameters

[NOT SPECIFIED]

##### Headers

[NOT SPECIFIED]

##### Request Body

Content type: application/json

Schema:

`EvaluateDto`

Example (generated from schema):

```json
{
  "brand": "string",
  "division": "string",
  "metrics": {
    "key": 0
  }
}
```

Notes: Request body is required.

#### Responses

##### `200`

Description: OK (explicit @HttpCode(200) override of default POST 201)

Content type: application/json

Schema:

`GuardrailEvaluationResult`

Example (generated from schema):

```json
{
  "compliant": false,
  "results": [
    {
      "id": 0,
      "rule": "string",
      "op": "string",
      "threshold": "string",
      "unit": "string",
      "actual": 0,
      "passed": false,
      "isOverridable": false,
      "severity": "hard"
    }
  ]
}
```

##### Error Responses

[NOT SPECIFIED] (no documented error responses for this endpoint)

#### Validation / Constraints

- Required request body fields: `brand`, `division`, `metrics`
- x-note: No runtime validation. A missing `metrics` field causes an unhandled TypeError (surfaces as 500), not a clean 400.

#### Related Schemas

`EvaluateDto`, `GuardrailCheckResult`, `GuardrailEvaluationResult`

### `DELETE /guardrails/{id}`

Summary: Delete a guardrail

Description: [NOT SPECIFIED]

Tags: guardrails

Backend operationId: `deleteGuardrail`

#### Request

##### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| id | integer | Yes | Guardrail id, parsed via ParseIntPipe (400 if non-numeric). |

##### Query Parameters

[NOT SPECIFIED]

##### Headers

[NOT SPECIFIED]

##### Request Body

Content type: [NOT SPECIFIED]

Schema:

[NOT SPECIFIED] (no request body for this endpoint)

Notes: [NOT SPECIFIED]

#### Responses

##### `204`

Description: Deleted, no content

Content type: [NOT SPECIFIED] (no content)

Schema:

[NOT SPECIFIED]

Example: [NOT SPECIFIED]

##### Error Responses

**`400`**

Description: The :id path parameter could not be parsed as an integer.

Schema: `ErrorResponse`

Example (generated from schema):

```json
{
  "statusCode": 0,
  "message": "string",
  "error": "string"
}
```

**`404`**

Description: Resource not found.

Schema: `ErrorResponse`

Example (generated from schema):

```json
{
  "statusCode": 0,
  "message": "string",
  "error": "string"
}
```

#### Validation / Constraints

[NOT SPECIFIED]

#### Related Schemas

`ErrorResponse`

### `PATCH /guardrails/{id}`

Summary: Partially update a guardrail

Description: [NOT SPECIFIED]

Tags: guardrails

Backend operationId: `updateGuardrail`

#### Request

##### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| id | integer | Yes | Guardrail id, parsed via ParseIntPipe (400 if non-numeric). |

##### Query Parameters

[NOT SPECIFIED]

##### Headers

[NOT SPECIFIED]

##### Request Body

Content type: application/json

Schema:

`UpdateGuardrailDto`

Example (generated from schema):

```json
{
  "brand": "string",
  "division": "string",
  "rule": "string",
  "op": "string",
  "value": "string",
  "unit": "string"
}
```

Notes: Request body is required.

#### Responses

##### `200`

Description: OK

Content type: application/json

Schema:

`GuardrailEntity`

Example (generated from schema):

```json
{
  "id": 0,
  "brand": "string",
  "division": "string",
  "rule": "string",
  "op": "string",
  "value": "string",
  "unit": "string",
  "active": false,
  "isOverridable": false
}
```

##### Error Responses

**`400`**

Description: The :id path parameter could not be parsed as an integer.

Schema: `ErrorResponse`

Example (generated from schema):

```json
{
  "statusCode": 0,
  "message": "string",
  "error": "string"
}
```

**`404`**

Description: Resource not found.

Schema: `ErrorResponse`

Example (generated from schema):

```json
{
  "statusCode": 0,
  "message": "string",
  "error": "string"
}
```

#### Validation / Constraints

[NOT SPECIFIED]

#### Related Schemas

`ErrorResponse`, `GuardrailEntity`, `UpdateGuardrailDto`

### `PATCH /guardrails/{id}/active`

Summary: Toggle a guardrail's active flag

Description: [NOT SPECIFIED]

Tags: guardrails

Backend operationId: `toggleGuardrailActive`

#### Request

##### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| id | integer | Yes | Guardrail id, parsed via ParseIntPipe (400 if non-numeric). |

##### Query Parameters

[NOT SPECIFIED]

##### Headers

[NOT SPECIFIED]

##### Request Body

Content type: [NOT SPECIFIED]

Schema:

[NOT SPECIFIED] (no request body for this endpoint)

Notes: [NOT SPECIFIED]

#### Responses

##### `200`

Description: OK (explicit @HttpCode(200))

Content type: application/json

Schema:

`GuardrailEntity`

Example (generated from schema):

```json
{
  "id": 0,
  "brand": "string",
  "division": "string",
  "rule": "string",
  "op": "string",
  "value": "string",
  "unit": "string",
  "active": false,
  "isOverridable": false
}
```

##### Error Responses

**`400`**

Description: The :id path parameter could not be parsed as an integer.

Schema: `ErrorResponse`

Example (generated from schema):

```json
{
  "statusCode": 0,
  "message": "string",
  "error": "string"
}
```

**`404`**

Description: Resource not found.

Schema: `ErrorResponse`

Example (generated from schema):

```json
{
  "statusCode": 0,
  "message": "string",
  "error": "string"
}
```

#### Validation / Constraints

[NOT SPECIFIED]

#### Related Schemas

`ErrorResponse`, `GuardrailEntity`

### `PATCH /guardrails/{id}/overridable`

Summary: Toggle a guardrail's isOverridable flag

Description: [NOT SPECIFIED]

Tags: guardrails

Backend operationId: `toggleGuardrailOverridable`

#### Request

##### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| id | integer | Yes | Guardrail id, parsed via ParseIntPipe (400 if non-numeric). |

##### Query Parameters

[NOT SPECIFIED]

##### Headers

[NOT SPECIFIED]

##### Request Body

Content type: [NOT SPECIFIED]

Schema:

[NOT SPECIFIED] (no request body for this endpoint)

Notes: [NOT SPECIFIED]

#### Responses

##### `200`

Description: OK (explicit @HttpCode(200))

Content type: application/json

Schema:

`GuardrailEntity`

Example (generated from schema):

```json
{
  "id": 0,
  "brand": "string",
  "division": "string",
  "rule": "string",
  "op": "string",
  "value": "string",
  "unit": "string",
  "active": false,
  "isOverridable": false
}
```

##### Error Responses

**`400`**

Description: The :id path parameter could not be parsed as an integer.

Schema: `ErrorResponse`

Example (generated from schema):

```json
{
  "statusCode": 0,
  "message": "string",
  "error": "string"
}
```

**`404`**

Description: Resource not found.

Schema: `ErrorResponse`

Example (generated from schema):

```json
{
  "statusCode": 0,
  "message": "string",
  "error": "string"
}
```

#### Validation / Constraints

[NOT SPECIFIED]

#### Related Schemas

`ErrorResponse`, `GuardrailEntity`

### `GET /health`

Summary: Liveness check

Description: [NOT SPECIFIED]

Tags: health

Backend operationId: `getHealth`

#### Request

##### Path Parameters

[NOT SPECIFIED]

##### Query Parameters

[NOT SPECIFIED]

##### Headers

[NOT SPECIFIED]

##### Request Body

Content type: [NOT SPECIFIED]

Schema:

[NOT SPECIFIED] (no request body for this endpoint)

Notes: [NOT SPECIFIED]

#### Responses

##### `200`

Description: Service is up

Content type: application/json

Schema:

`HealthStatus`

Example (generated from schema):

```json
{
  "status": "ok"
}
```

##### Error Responses

[NOT SPECIFIED] (no documented error responses for this endpoint)

#### Validation / Constraints

[NOT SPECIFIED]

#### Related Schemas

`HealthStatus`

### `GET /price-scenarios`

Summary: List all price scenarios, newest id first

Description: [NOT SPECIFIED]

Tags: price-scenarios

Backend operationId: `listPriceScenarios`

#### Request

##### Path Parameters

[NOT SPECIFIED]

##### Query Parameters

[NOT SPECIFIED]

##### Headers

[NOT SPECIFIED]

##### Request Body

Content type: [NOT SPECIFIED]

Schema:

[NOT SPECIFIED] (no request body for this endpoint)

Notes: [NOT SPECIFIED]

#### Responses

##### `200`

Description: OK

Content type: application/json

Schema:

array of `ScenarioEntity`

Example (generated from schema):

```json
[
  {
    "id": 0,
    "name": "string",
    "focusGroupId": "string",
    "focusGroupName": "string",
    "skuCount": 0,
    "startDate": "2026-08-01",
    "endDate": "2026-08-01",
    "objectives": {
      "revenue": 0,
      "grossMargin": 0,
      "sellThrough": 0
    },
    "optimizationLevel": 0,
    "status": "new",
    "createdAt": "2026-08-01T00:00:00.000Z",
    "changeRequests": [
      {
        "requestedAt": "2026-08-01T00:00:00.000Z",
        "comment": "string"
      }
    ],
    "output": {
      "narrative": "string",
      "uncertainty": "string",
      "guardrailResults": [
        null
      ],
      "comparison": [
        null
      ],
      "frontier": [
        null
      ],
      "currentPoint": null,
      "mlRecPoint": null,
      "scenarioPoint": null,
      "recommendations": [
        null
      ]
    }
  }
]
```

##### Error Responses

[NOT SPECIFIED] (no documented error responses for this endpoint)

#### Validation / Constraints

[NOT SPECIFIED]

#### Related Schemas

`ChangeRequest`, `ComparisonRow`, `FrontierPoint`, `Recommendation`, `ScenarioEntity`, `ScenarioGuardrailCheck`, `ScenarioObjectives`, `ScenarioOutput`

### `POST /price-scenarios`

Summary: Create a price scenario

Description: x-note: Unlike discount-models' create, a focusGroupId that does not resolve to an existing focus set is NOT swallowed here — the NotFoundException propagates as a 404 for this endpoint.

Tags: price-scenarios

Backend operationId: `createPriceScenario`

#### Request

##### Path Parameters

[NOT SPECIFIED]

##### Query Parameters

[NOT SPECIFIED]

##### Headers

[NOT SPECIFIED]

##### Request Body

Content type: application/json

Schema:

`CreateScenarioDto`

Example (generated from schema):

```json
{
  "name": "string",
  "focusGroupId": "string",
  "startDate": "2026-08-01",
  "endDate": "2026-08-01",
  "objectives": {
    "revenue": 0,
    "grossMargin": 0,
    "sellThrough": 0
  },
  "optimizationLevel": 0
}
```

Notes: Request body is required.

#### Responses

##### `201`

Description: Created, status is always "new", output is null, changeRequests is [].

Content type: application/json

Schema:

`ScenarioEntity`

Example (generated from schema):

```json
{
  "id": 0,
  "name": "string",
  "focusGroupId": "string",
  "focusGroupName": "string",
  "skuCount": 0,
  "startDate": "2026-08-01",
  "endDate": "2026-08-01",
  "objectives": {
    "revenue": 0,
    "grossMargin": 0,
    "sellThrough": 0
  },
  "optimizationLevel": 0,
  "status": "new",
  "createdAt": "2026-08-01T00:00:00.000Z",
  "changeRequests": [
    {
      "requestedAt": "2026-08-01T00:00:00.000Z",
      "comment": "string"
    }
  ],
  "output": {
    "narrative": "string",
    "uncertainty": "string",
    "guardrailResults": [
      null
    ],
    "comparison": [
      null
    ],
    "frontier": [
      null
    ],
    "currentPoint": {
      "level": null,
      "revenue": null,
      "profit": null
    },
    "mlRecPoint": {
      "level": null,
      "revenue": null,
      "profit": null
    },
    "scenarioPoint": {
      "level": null,
      "revenue": null,
      "profit": null
    },
    "recommendations": [
      null
    ]
  }
}
```

##### Error Responses

**`404`**

Description: focusGroupId does not resolve to an existing focus set.

Schema: `ErrorResponse`

Example (generated from schema):

```json
{
  "statusCode": 0,
  "message": "string",
  "error": "string"
}
```

#### Validation / Constraints

- Required request body fields: `name`, `focusGroupId`, `startDate`, `endDate`, `objectives`, `optimizationLevel`
- `startDate` format: date
- `endDate` format: date

#### Related Schemas

`ChangeRequest`, `ComparisonRow`, `CreateScenarioDto`, `ErrorResponse`, `FrontierPoint`, `Recommendation`, `ScenarioEntity`, `ScenarioGuardrailCheck`, `ScenarioObjectives`, `ScenarioOutput`

### `DELETE /price-scenarios/{id}`

Summary: Delete a price scenario

Description: [NOT SPECIFIED]

Tags: price-scenarios

Backend operationId: `deletePriceScenario`

#### Request

##### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| id | integer | Yes | Price scenario id, parsed via ParseIntPipe (400 if non-numeric). |

##### Query Parameters

[NOT SPECIFIED]

##### Headers

[NOT SPECIFIED]

##### Request Body

Content type: [NOT SPECIFIED]

Schema:

[NOT SPECIFIED] (no request body for this endpoint)

Notes: [NOT SPECIFIED]

#### Responses

##### `204`

Description: Deleted, no content

Content type: [NOT SPECIFIED] (no content)

Schema:

[NOT SPECIFIED]

Example: [NOT SPECIFIED]

##### Error Responses

**`400`**

Description: The :id path parameter could not be parsed as an integer.

Schema: `ErrorResponse`

Example (generated from schema):

```json
{
  "statusCode": 0,
  "message": "string",
  "error": "string"
}
```

**`404`**

Description: Resource not found.

Schema: `ErrorResponse`

Example (generated from schema):

```json
{
  "statusCode": 0,
  "message": "string",
  "error": "string"
}
```

#### Validation / Constraints

[NOT SPECIFIED]

#### Related Schemas

`ErrorResponse`

### `GET /price-scenarios/{id}`

Summary: Get a price scenario by id

Description: [NOT SPECIFIED]

Tags: price-scenarios

Backend operationId: `getPriceScenario`

#### Request

##### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| id | integer | Yes | Price scenario id, parsed via ParseIntPipe (400 if non-numeric). |

##### Query Parameters

[NOT SPECIFIED]

##### Headers

[NOT SPECIFIED]

##### Request Body

Content type: [NOT SPECIFIED]

Schema:

[NOT SPECIFIED] (no request body for this endpoint)

Notes: [NOT SPECIFIED]

#### Responses

##### `200`

Description: OK

Content type: application/json

Schema:

`ScenarioEntity`

Example (generated from schema):

```json
{
  "id": 0,
  "name": "string",
  "focusGroupId": "string",
  "focusGroupName": "string",
  "skuCount": 0,
  "startDate": "2026-08-01",
  "endDate": "2026-08-01",
  "objectives": {
    "revenue": 0,
    "grossMargin": 0,
    "sellThrough": 0
  },
  "optimizationLevel": 0,
  "status": "new",
  "createdAt": "2026-08-01T00:00:00.000Z",
  "changeRequests": [
    {
      "requestedAt": "2026-08-01T00:00:00.000Z",
      "comment": "string"
    }
  ],
  "output": {
    "narrative": "string",
    "uncertainty": "string",
    "guardrailResults": [
      null
    ],
    "comparison": [
      null
    ],
    "frontier": [
      null
    ],
    "currentPoint": {
      "level": null,
      "revenue": null,
      "profit": null
    },
    "mlRecPoint": {
      "level": null,
      "revenue": null,
      "profit": null
    },
    "scenarioPoint": {
      "level": null,
      "revenue": null,
      "profit": null
    },
    "recommendations": [
      null
    ]
  }
}
```

##### Error Responses

**`400`**

Description: The :id path parameter could not be parsed as an integer.

Schema: `ErrorResponse`

Example (generated from schema):

```json
{
  "statusCode": 0,
  "message": "string",
  "error": "string"
}
```

**`404`**

Description: Resource not found.

Schema: `ErrorResponse`

Example (generated from schema):

```json
{
  "statusCode": 0,
  "message": "string",
  "error": "string"
}
```

#### Validation / Constraints

[NOT SPECIFIED]

#### Related Schemas

`ChangeRequest`, `ComparisonRow`, `ErrorResponse`, `FrontierPoint`, `Recommendation`, `ScenarioEntity`, `ScenarioGuardrailCheck`, `ScenarioObjectives`, `ScenarioOutput`

### `GET /price-scenarios/{id}/deep-dive`

Summary: Get the deep-dive breakdown for a scenario that has been run

Description: priceAdjustments.length === min(20, skuCount); marketingTiles and discountTiles each have exactly 5 entries (one per UNLOCK_LEVELS = [0,20,40,60,80]).

Tags: price-scenarios

Backend operationId: `getPriceScenarioDeepDive`

#### Request

##### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| id | integer | Yes | Price scenario id, parsed via ParseIntPipe (400 if non-numeric). |

##### Query Parameters

[NOT SPECIFIED]

##### Headers

[NOT SPECIFIED]

##### Request Body

Content type: [NOT SPECIFIED]

Schema:

[NOT SPECIFIED] (no request body for this endpoint)

Notes: [NOT SPECIFIED]

#### Responses

##### `200`

Description: OK

Content type: application/json

Schema:

`DeepDiveOutput`

Example (generated from schema):

```json
{
  "priceAdjustments": [
    {
      "sku": "string",
      "productName": "string",
      "category": "string",
      "brand": "string",
      "currentPrice": 0,
      "recommendedPrice": 0,
      "priceChange": 0,
      "priceChangePct": 0,
      "currentGrossMargin": 0,
      "projectedGrossMargin": 0,
      "weeklyRevenue": 0,
      "projectedRevenue": 0,
      "currentWeeksOfSupply": 0,
      "projectedWeeksOfSupply": 0,
      "unlockLevel": 0
    }
  ],
  "marketingTiles": [
    {
      "id": "string",
      "campaign": "string",
      "type": "string",
      "discount": "string",
      "skuCount": 0,
      "projectedLift": "string",
      "unlockLevel": 0,
      "products": [
        null
      ]
    }
  ],
  "discountTiles": [
    {
      "id": "string",
      "name": "string",
      "type": "string",
      "depth": "string",
      "skuCount": 0,
      "projectedSellThrough": "string",
      "unlockLevel": 0,
      "products": [
        null
      ]
    }
  ]
}
```

##### Error Responses

**`400`**

Description: The :id path parameter could not be parsed as an integer.

Schema: `ErrorResponse`

Example (generated from schema):

```json
{
  "statusCode": 0,
  "message": "string",
  "error": "string"
}
```

**`404`**

Description: Scenario id unknown, OR the scenario exists but has not been run yet (output is null). Both cases return 404, distinguished only by message text — no 409/400 is used for the not-run-yet precondition failure.

Schema: `ErrorResponse`

Example (generated from schema):

```json
{
  "statusCode": 0,
  "message": "string",
  "error": "string"
}
```

#### Validation / Constraints

[NOT SPECIFIED]

#### Related Schemas

`DeepDiveOutput`, `DiscountTile`, `DiscountTileProduct`, `ErrorResponse`, `MarketingTile`, `MarketingTileProduct`, `SkuRecommendationRow`

### `POST /price-scenarios/{id}/run`

Summary: Run the price scenario and populate its output

Description: Forces status to "draft". frontier has 11 points (levels 0,10,...,100), comparison has 7 rows, recommendations has exactly 4 entries (sliced from 6 templates). guardrailResults only includes currently-active guardrails. uncertainty string always contains "±". scenarioPoint.level equals the optimizationLevel set at creation.

Tags: price-scenarios

Backend operationId: `runPriceScenario`

#### Request

##### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| id | integer | Yes | Price scenario id, parsed via ParseIntPipe (400 if non-numeric). |

##### Query Parameters

[NOT SPECIFIED]

##### Headers

[NOT SPECIFIED]

##### Request Body

Content type: [NOT SPECIFIED]

Schema:

[NOT SPECIFIED] (no request body for this endpoint)

Notes: [NOT SPECIFIED]

#### Responses

##### `200`

Description: OK (explicit @HttpCode(200))

Content type: application/json

Schema:

`ScenarioEntity`

Example (generated from schema):

```json
{
  "id": 0,
  "name": "string",
  "focusGroupId": "string",
  "focusGroupName": "string",
  "skuCount": 0,
  "startDate": "2026-08-01",
  "endDate": "2026-08-01",
  "objectives": {
    "revenue": 0,
    "grossMargin": 0,
    "sellThrough": 0
  },
  "optimizationLevel": 0,
  "status": "new",
  "createdAt": "2026-08-01T00:00:00.000Z",
  "changeRequests": [
    {
      "requestedAt": "2026-08-01T00:00:00.000Z",
      "comment": "string"
    }
  ],
  "output": {
    "narrative": "string",
    "uncertainty": "string",
    "guardrailResults": [
      null
    ],
    "comparison": [
      null
    ],
    "frontier": [
      null
    ],
    "currentPoint": {
      "level": null,
      "revenue": null,
      "profit": null
    },
    "mlRecPoint": {
      "level": null,
      "revenue": null,
      "profit": null
    },
    "scenarioPoint": {
      "level": null,
      "revenue": null,
      "profit": null
    },
    "recommendations": [
      null
    ]
  }
}
```

##### Error Responses

**`400`**

Description: The :id path parameter could not be parsed as an integer.

Schema: `ErrorResponse`

Example (generated from schema):

```json
{
  "statusCode": 0,
  "message": "string",
  "error": "string"
}
```

**`404`**

Description: Resource not found.

Schema: `ErrorResponse`

Example (generated from schema):

```json
{
  "statusCode": 0,
  "message": "string",
  "error": "string"
}
```

#### Validation / Constraints

[NOT SPECIFIED]

#### Related Schemas

`ChangeRequest`, `ComparisonRow`, `ErrorResponse`, `FrontierPoint`, `Recommendation`, `ScenarioEntity`, `ScenarioGuardrailCheck`, `ScenarioObjectives`, `ScenarioOutput`

### `PATCH /price-scenarios/{id}/status`

Summary: Force-set a price scenario's status

Description: No transition rules enforced (any string is assigned as-is). Side effect: if status is "returned" AND a non-empty comment is provided, a ChangeRequest is appended to changeRequests (array only ever grows). If status is "returned" with no comment, no change-request record is added.

Tags: price-scenarios

Backend operationId: `updatePriceScenarioStatus`

#### Request

##### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| id | integer | Yes | Price scenario id, parsed via ParseIntPipe (400 if non-numeric). |

##### Query Parameters

[NOT SPECIFIED]

##### Headers

[NOT SPECIFIED]

##### Request Body

Content type: application/json

Schema:

`ScenarioUpdateStatusDto`

Example (generated from schema):

```json
{
  "status": "new",
  "comment": "string"
}
```

Notes: Request body is required.

#### Responses

##### `200`

Description: OK (explicit @HttpCode(200))

Content type: application/json

Schema:

`ScenarioEntity`

Example (generated from schema):

```json
{
  "id": 0,
  "name": "string",
  "focusGroupId": "string",
  "focusGroupName": "string",
  "skuCount": 0,
  "startDate": "2026-08-01",
  "endDate": "2026-08-01",
  "objectives": {
    "revenue": 0,
    "grossMargin": 0,
    "sellThrough": 0
  },
  "optimizationLevel": 0,
  "status": "new",
  "createdAt": "2026-08-01T00:00:00.000Z",
  "changeRequests": [
    {
      "requestedAt": "2026-08-01T00:00:00.000Z",
      "comment": "string"
    }
  ],
  "output": {
    "narrative": "string",
    "uncertainty": "string",
    "guardrailResults": [
      null
    ],
    "comparison": [
      null
    ],
    "frontier": [
      null
    ],
    "currentPoint": {
      "level": null,
      "revenue": null,
      "profit": null
    },
    "mlRecPoint": {
      "level": null,
      "revenue": null,
      "profit": null
    },
    "scenarioPoint": {
      "level": null,
      "revenue": null,
      "profit": null
    },
    "recommendations": [
      null
    ]
  }
}
```

##### Error Responses

**`400`**

Description: The :id path parameter could not be parsed as an integer.

Schema: `ErrorResponse`

Example (generated from schema):

```json
{
  "statusCode": 0,
  "message": "string",
  "error": "string"
}
```

**`404`**

Description: Resource not found.

Schema: `ErrorResponse`

Example (generated from schema):

```json
{
  "statusCode": 0,
  "message": "string",
  "error": "string"
}
```

#### Validation / Constraints

- Required request body fields: `status`
- `status` enum: new, draft, pending, approved, denied, returned

#### Related Schemas

`ChangeRequest`, `ComparisonRow`, `ErrorResponse`, `FrontierPoint`, `Recommendation`, `ScenarioEntity`, `ScenarioGuardrailCheck`, `ScenarioObjectives`, `ScenarioOutput`, `ScenarioUpdateStatusDto`

### `POST /price-scenarios/{id}/submit`

Summary: Submit a price scenario for approval

Description: Accepts current status "draft" OR "returned" (supports a revise-and-resubmit workflow not present in discount-models).

Tags: price-scenarios

Backend operationId: `submitPriceScenario`

#### Request

##### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| id | integer | Yes | Price scenario id, parsed via ParseIntPipe (400 if non-numeric). |

##### Query Parameters

[NOT SPECIFIED]

##### Headers

[NOT SPECIFIED]

##### Request Body

Content type: [NOT SPECIFIED]

Schema:

[NOT SPECIFIED] (no request body for this endpoint)

Notes: [NOT SPECIFIED]

#### Responses

##### `200`

Description: OK (explicit @HttpCode(200)), status becomes "pending".

Content type: application/json

Schema:

`ScenarioEntity`

Example (generated from schema):

```json
{
  "id": 0,
  "name": "string",
  "focusGroupId": "string",
  "focusGroupName": "string",
  "skuCount": 0,
  "startDate": "2026-08-01",
  "endDate": "2026-08-01",
  "objectives": {
    "revenue": 0,
    "grossMargin": 0,
    "sellThrough": 0
  },
  "optimizationLevel": 0,
  "status": "new",
  "createdAt": "2026-08-01T00:00:00.000Z",
  "changeRequests": [
    {
      "requestedAt": "2026-08-01T00:00:00.000Z",
      "comment": "string"
    }
  ],
  "output": {
    "narrative": "string",
    "uncertainty": "string",
    "guardrailResults": [
      null
    ],
    "comparison": [
      null
    ],
    "frontier": [
      null
    ],
    "currentPoint": {
      "level": null,
      "revenue": null,
      "profit": null
    },
    "mlRecPoint": {
      "level": null,
      "revenue": null,
      "profit": null
    },
    "scenarioPoint": {
      "level": null,
      "revenue": null,
      "profit": null
    },
    "recommendations": [
      null
    ]
  }
}
```

##### Error Responses

**`400`**

Description: Current status is neither "draft" nor "returned".

Schema: `ErrorResponse`

Example (generated from schema):

```json
{
  "statusCode": 0,
  "message": "string",
  "error": "string"
}
```

**`404`**

Description: Resource not found.

Schema: `ErrorResponse`

Example (generated from schema):

```json
{
  "statusCode": 0,
  "message": "string",
  "error": "string"
}
```

#### Validation / Constraints

[NOT SPECIFIED]

#### Related Schemas

`ChangeRequest`, `ComparisonRow`, `ErrorResponse`, `FrontierPoint`, `Recommendation`, `ScenarioEntity`, `ScenarioGuardrailCheck`, `ScenarioObjectives`, `ScenarioOutput`

### `GET /product-grid/{focusSetId}`

Summary: Get the product grid derived from a saved focus set's filter

Description: [NOT SPECIFIED]

Tags: product-grid

Backend operationId: `getProductGrid`

#### Request

##### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| focusSetId | string | Yes | Focus set id (plain string, no coercion pipe). |

##### Query Parameters

[NOT SPECIFIED]

##### Headers

[NOT SPECIFIED]

##### Request Body

Content type: [NOT SPECIFIED]

Schema:

[NOT SPECIFIED] (no request body for this endpoint)

Notes: [NOT SPECIFIED]

#### Responses

##### `200`

Description: OK

Content type: application/json

Schema:

`ProductGridView`

Example (generated from schema):

```json
{
  "focusSetId": "string",
  "focusSetName": "string",
  "filter": {
    "type": "rule",
    "attr": "string",
    "val": "string"
  },
  "products": [
    {
      "productId": "string",
      "productName": "string",
      "brand": "string",
      "division": "string",
      "category": "string",
      "skuCount": 0,
      "activeSkuCount": 0,
      "priceRange": [
        0,
        0
      ],
      "totalQty": 0,
      "stockStatus": "In_Stock",
      "skus": [
        null
      ]
    }
  ],
  "totalSkuCount": 0,
  "activeSkuCount": 0
}
```

##### Error Responses

**`404`**

Description: Resource not found.

Schema: `ErrorResponse`

Example (generated from schema):

```json
{
  "statusCode": 0,
  "message": "string",
  "error": "string"
}
```

#### Validation / Constraints

[NOT SPECIFIED]

#### Related Schemas

`ConditionGroupNode`, `ConditionNode`, `ConditionRuleNode`, `ErrorResponse`, `ProductGridView`, `ProductRow`, `SkuRow`

### `POST /product-grid/{focusSetId}/exclude`

Summary: Mark a SKU as excluded within a focus set's grid

Description: Echoes the input skuId without verifying it actually exists in the catalog or in the focus set's resolved SKU list.

Tags: product-grid

Backend operationId: `excludeSkuFromGrid`

#### Request

##### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| focusSetId | string | Yes | Focus set id (plain string, no coercion pipe). |

##### Query Parameters

[NOT SPECIFIED]

##### Headers

[NOT SPECIFIED]

##### Request Body

Content type: application/json

Schema:

object

Example (generated from schema):

```json
{
  "skuId": "string"
}
```

Notes: Request body is required.

#### Responses

##### `200`

Description: OK (explicit @HttpCode(200) override of default POST 201)

Content type: application/json

Schema:

object

Example (generated from schema):

```json
{
  "excludedSkuId": "string"
}
```

##### Error Responses

**`404`**

Description: Resource not found.

Schema: `ErrorResponse`

Example (generated from schema):

```json
{
  "statusCode": 0,
  "message": "string",
  "error": "string"
}
```

#### Validation / Constraints

- Required request body fields: `skuId`

#### Related Schemas

`ErrorResponse`

### `DELETE /product-grid/{focusSetId}/exclusions`

Summary: Restore (un-exclude) all SKUs for a focus set

Description: x-note: Does NOT 404 for an unknown focusSetId — silent no-op, same asymmetry as the single-sku restore endpoint above.

Tags: product-grid

Backend operationId: `restoreAllExcludedSkus`

#### Request

##### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| focusSetId | string | Yes | Focus set id (plain string, no coercion pipe). |

##### Query Parameters

[NOT SPECIFIED]

##### Headers

[NOT SPECIFIED]

##### Request Body

Content type: [NOT SPECIFIED]

Schema:

[NOT SPECIFIED] (no request body for this endpoint)

Notes: [NOT SPECIFIED]

#### Responses

##### `204`

Description: Deleted (or no-op if unknown), no content

Content type: [NOT SPECIFIED] (no content)

Schema:

[NOT SPECIFIED]

Example: [NOT SPECIFIED]

##### Error Responses

[NOT SPECIFIED] (no documented error responses for this endpoint)

#### Validation / Constraints

[NOT SPECIFIED]

#### Related Schemas

[NOT SPECIFIED]

### `DELETE /product-grid/{focusSetId}/exclusions/{skuId}`

Summary: Restore (un-exclude) a single SKU

Description: x-note: Does NOT 404 for an unknown focusSetId or skuId — the operation is a silent no-op via optional-chained Map delete. This is inconsistent with every other delete/removal endpoint in the API, which does 404 on an unknown id.

Tags: product-grid

Backend operationId: `restoreExcludedSku`

#### Request

##### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| focusSetId | string | Yes | Focus set id (plain string, no coercion pipe). |
| skuId | string | Yes | [NOT SPECIFIED] |

##### Query Parameters

[NOT SPECIFIED]

##### Headers

[NOT SPECIFIED]

##### Request Body

Content type: [NOT SPECIFIED]

Schema:

[NOT SPECIFIED] (no request body for this endpoint)

Notes: [NOT SPECIFIED]

#### Responses

##### `204`

Description: Deleted (or no-op if unknown), no content

Content type: [NOT SPECIFIED] (no content)

Schema:

[NOT SPECIFIED]

Example: [NOT SPECIFIED]

##### Error Responses

[NOT SPECIFIED] (no documented error responses for this endpoint)

#### Validation / Constraints

[NOT SPECIFIED]

#### Related Schemas

[NOT SPECIFIED]

### `GET /promotions`

Summary: List all promotions

Description: `status` on each entity is derived on every read (not stored) from startDate/endDate compared against today's date (YYYY-MM-DD string comparison), not persisted server state.

Tags: promotions

Backend operationId: `listPromotions`

#### Request

##### Path Parameters

[NOT SPECIFIED]

##### Query Parameters

[NOT SPECIFIED]

##### Headers

[NOT SPECIFIED]

##### Request Body

Content type: [NOT SPECIFIED]

Schema:

[NOT SPECIFIED] (no request body for this endpoint)

Notes: [NOT SPECIFIED]

#### Responses

##### `200`

Description: OK

Content type: application/json

Schema:

array of `PromotionEntity`

Example (generated from schema):

```json
[
  {
    "id": 0,
    "name": "string",
    "startDate": "2026-08-01",
    "endDate": "2026-08-01",
    "discountType": "percentage",
    "discountValue": 0,
    "focusSetId": "string",
    "channel": "string",
    "color": "string",
    "notes": "string",
    "status": "active"
  }
]
```

##### Error Responses

[NOT SPECIFIED] (no documented error responses for this endpoint)

#### Validation / Constraints

[NOT SPECIFIED]

#### Related Schemas

`PromotionEntity`

### `POST /promotions`

Summary: Create a promotion

Description: `focusSetId` defaults to "" if omitted; `notes` defaults to "" if omitted. The linked focus set is NOT resolved/validated at create time (only when GET /promotions/{id}/products is later called).

Tags: promotions

Backend operationId: `createPromotion`

#### Request

##### Path Parameters

[NOT SPECIFIED]

##### Query Parameters

[NOT SPECIFIED]

##### Headers

[NOT SPECIFIED]

##### Request Body

Content type: application/json

Schema:

`CreatePromotionDto`

Example (generated from schema):

```json
{
  "name": "string",
  "startDate": "2026-08-01",
  "endDate": "2026-08-01",
  "discountType": "percentage",
  "discountValue": 0,
  "focusSetId": "string",
  "channel": "string",
  "color": "string",
  "notes": "string"
}
```

Notes: Request body is required.

#### Responses

##### `201`

Description: Created

Content type: application/json

Schema:

`PromotionEntity`

Example (generated from schema):

```json
{
  "id": 0,
  "name": "string",
  "startDate": "2026-08-01",
  "endDate": "2026-08-01",
  "discountType": "percentage",
  "discountValue": 0,
  "focusSetId": "string",
  "channel": "string",
  "color": "string",
  "notes": "string",
  "status": "active"
}
```

##### Error Responses

**`400`**

Description: endDate is not strictly after startDate (string comparison).

Schema: `ErrorResponse`

Example (generated from schema):

```json
{
  "statusCode": 0,
  "message": "string",
  "error": "string"
}
```

#### Validation / Constraints

- Required request body fields: `name`, `startDate`, `endDate`, `discountType`, `discountValue`, `focusSetId`, `channel`, `color`
- `startDate` format: date
- `endDate` format: date
- `discountType` enum: percentage, flat

#### Related Schemas

`CreatePromotionDto`, `ErrorResponse`, `PromotionEntity`

### `DELETE /promotions/{id}`

Summary: Delete a promotion

Description: [NOT SPECIFIED]

Tags: promotions

Backend operationId: `deletePromotion`

#### Request

##### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| id | integer | Yes | Promotion id, parsed via ParseIntPipe (400 if non-numeric). |

##### Query Parameters

[NOT SPECIFIED]

##### Headers

[NOT SPECIFIED]

##### Request Body

Content type: [NOT SPECIFIED]

Schema:

[NOT SPECIFIED] (no request body for this endpoint)

Notes: [NOT SPECIFIED]

#### Responses

##### `204`

Description: Deleted, no content

Content type: [NOT SPECIFIED] (no content)

Schema:

[NOT SPECIFIED]

Example: [NOT SPECIFIED]

##### Error Responses

**`404`**

Description: Resource not found.

Schema: `ErrorResponse`

Example (generated from schema):

```json
{
  "statusCode": 0,
  "message": "string",
  "error": "string"
}
```

#### Validation / Constraints

[NOT SPECIFIED]

#### Related Schemas

`ErrorResponse`

### `PATCH /promotions/{id}`

Summary: Partially update a promotion

Description: [NOT SPECIFIED]

Tags: promotions

Backend operationId: `updatePromotion`

#### Request

##### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| id | integer | Yes | Promotion id, parsed via ParseIntPipe (400 if non-numeric). |

##### Query Parameters

[NOT SPECIFIED]

##### Headers

[NOT SPECIFIED]

##### Request Body

Content type: application/json

Schema:

`UpdatePromotionDto`

Example (generated from schema):

```json
{
  "name": "string",
  "startDate": "2026-08-01",
  "endDate": "2026-08-01",
  "discountType": "percentage",
  "discountValue": 0,
  "focusSetId": "string",
  "channel": "string",
  "color": "string",
  "notes": "string"
}
```

Notes: Request body is required.

#### Responses

##### `200`

Description: OK

Content type: application/json

Schema:

`PromotionEntity`

Example (generated from schema):

```json
{
  "id": 0,
  "name": "string",
  "startDate": "2026-08-01",
  "endDate": "2026-08-01",
  "discountType": "percentage",
  "discountValue": 0,
  "focusSetId": "string",
  "channel": "string",
  "color": "string",
  "notes": "string",
  "status": "active"
}
```

##### Error Responses

**`400`**

Description: Re-validated after merge: resulting startDate/endDate must satisfy endDate > startDate, even if only one date field was included in this PATCH body.

Schema: `ErrorResponse`

Example (generated from schema):

```json
{
  "statusCode": 0,
  "message": "string",
  "error": "string"
}
```

**`404`**

Description: Resource not found.

Schema: `ErrorResponse`

Example (generated from schema):

```json
{
  "statusCode": 0,
  "message": "string",
  "error": "string"
}
```

#### Validation / Constraints

- `startDate` format: date
- `endDate` format: date
- `discountType` enum: percentage, flat

#### Related Schemas

`ErrorResponse`, `PromotionEntity`, `UpdatePromotionDto`

### `GET /promotions/{id}/products`

Summary: Get the (discounted) product rows for a promotion

Description: Results are capped at the first 20 matching SKUs (`.slice(0, 20)`) — undocumented elsewhere in the codebase.

Tags: promotions

Backend operationId: `getPromotionProducts`

#### Request

##### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| id | integer | Yes | Promotion id, parsed via ParseIntPipe (400 if non-numeric). |

##### Query Parameters

[NOT SPECIFIED]

##### Headers

[NOT SPECIFIED]

##### Request Body

Content type: [NOT SPECIFIED]

Schema:

[NOT SPECIFIED] (no request body for this endpoint)

Notes: [NOT SPECIFIED]

#### Responses

##### `200`

Description: OK

Content type: application/json

Schema:

`PromoProductsView`

Example (generated from schema):

```json
{
  "promotionId": 0,
  "promotionName": "string",
  "discountType": "percentage",
  "discountValue": 0,
  "focusSetId": "string",
  "focusSetName": "string",
  "skus": [
    {
      "sku": "string",
      "name": "string",
      "brand": "string",
      "price": 0,
      "promoPrice": 0,
      "savings": 0
    }
  ]
}
```

##### Error Responses

**`400`**

Description: The :id path parameter could not be parsed as an integer.

Schema: `ErrorResponse`

Example (generated from schema):

```json
{
  "statusCode": 0,
  "message": "string",
  "error": "string"
}
```

**`404`**

Description: Promotion id unknown, OR the promotion's focusSetId does not resolve to an existing focus set (e.g. a promotion created with an empty/omitted focusSetId will always 404 here).

Schema: `ErrorResponse`

Example (generated from schema):

```json
{
  "statusCode": 0,
  "message": "string",
  "error": "string"
}
```

#### Validation / Constraints

[NOT SPECIFIED]

#### Related Schemas

`ErrorResponse`, `PromoProductRow`, `PromoProductsView`

## Schemas

### `ApprovalItemView`

Description: Tier-2, computed on read from a ScenarioEntity or DiscountModelEntity — not a persisted Tier-1 entity.

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| brand | string | Yes | No | v1 placeholder, paired with submitter. |
| changeRequests | array of `ChangeRequest` | Yes | No | scenario: ScenarioEntity.changeRequests, read through unmodified. discount: NOT from the underlying entity (which has no such field) — derived from ApprovalsService's own in-memory decision log, filtered to this item's action === "request_changes" entries. Lost on process restart in both the log and (for scenarios) the underlying in-memory store. |
| division | string | Yes | No | v1 placeholder, paired with submitter. |
| domain | string (enum: scenario, discount) | Yes | No | [NOT SPECIFIED] |
| id | integer | Yes | No | The underlying ScenarioEntity.id or DiscountModelEntity.id. |
| impact | string | Yes | No | scenario: the "Rev Uplift" comparison-row value (e.g. "+12.3%"). discount: kpis.revenueImpact formatted as `(sign)$(rounded, thousands-separated)`. |
| name | string | Yes | No | [NOT SPECIFIED] |
| risk | string (enum: Low, Medium, High) | Yes | No | discount: High if any RiskPanel.isHard, else Medium if any panel exists, else Low. scenario: falls back to the existing "Inventory Risk" comparison-row value (Low/Medium/High) — there is no dedicated $ inventory-risk-reduction metric in the v1 placeholder engine, so REQ-APPR-011's literal $10M/$5M thresholds are NOT implemented as stated. |
| status | string (enum: pending, approved, denied, returned) | Yes | No | Mirrors the underlying entity's status field verbatim. |
| submitter | string | Yes | No | v1 placeholder — rotated from a fixed 3-entry roster by `id % 3`. Not real submitter identity. |
| team | string | Yes | No | v1 placeholder, paired with submitter. |

Constraints: Required: `domain`, `id`, `name`, `submitter`, `team`, `brand`, `division`, `impact`, `risk`, `status`, `changeRequests`

Example (generated from schema):

```json
{
  "domain": "scenario",
  "id": 0,
  "name": "string",
  "submitter": "string",
  "team": "string",
  "brand": "string",
  "division": "string",
  "impact": "string",
  "risk": "Low",
  "status": "pending",
  "changeRequests": [
    {
      "requestedAt": "2026-08-01T00:00:00.000Z",
      "comment": "string"
    }
  ]
}
```

### `ApprovalsDecidedView`

Description: [NOT SPECIFIED]

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| discounts | array of `ApprovalItemView` | Yes | No | Only items with status in (approved, denied, returned). |
| scenarios | array of `ApprovalItemView` | Yes | No | Only items with status in (approved, denied, returned). |

Constraints: Required: `scenarios`, `discounts`

Example (generated from schema):

```json
{
  "scenarios": [
    {
      "domain": "scenario",
      "id": 0,
      "name": "string",
      "submitter": "string",
      "team": "string",
      "brand": "string",
      "division": "string",
      "impact": "string",
      "risk": "Low",
      "status": "pending",
      "changeRequests": [
        {
          "requestedAt": null,
          "comment": null
        }
      ]
    }
  ],
  "discounts": [
    {
      "domain": "scenario",
      "id": 0,
      "name": "string",
      "submitter": "string",
      "team": "string",
      "brand": "string",
      "division": "string",
      "impact": "string",
      "risk": "Low",
      "status": "pending",
      "changeRequests": [
        {
          "requestedAt": null,
          "comment": null
        }
      ]
    }
  ]
}
```

### `ApprovalsQueueView`

Description: [NOT SPECIFIED]

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| discountPendingCount | integer | Yes | No | Always equals discounts.length. |
| discounts | array of `ApprovalItemView` | Yes | No | Only items with status === "pending". |
| scenarioPendingCount | integer | Yes | No | Always equals scenarios.length. |
| scenarios | array of `ApprovalItemView` | Yes | No | Only items with status === "pending". |

Constraints: Required: `scenarios`, `discounts`, `scenarioPendingCount`, `discountPendingCount`

Example (generated from schema):

```json
{
  "scenarios": [
    {
      "domain": "scenario",
      "id": 0,
      "name": "string",
      "submitter": "string",
      "team": "string",
      "brand": "string",
      "division": "string",
      "impact": "string",
      "risk": "Low",
      "status": "pending",
      "changeRequests": [
        {
          "requestedAt": null,
          "comment": null
        }
      ]
    }
  ],
  "discounts": [
    {
      "domain": "scenario",
      "id": 0,
      "name": "string",
      "submitter": "string",
      "team": "string",
      "brand": "string",
      "division": "string",
      "impact": "string",
      "risk": "Low",
      "status": "pending",
      "changeRequests": [
        {
          "requestedAt": null,
          "comment": null
        }
      ]
    }
  ],
  "scenarioPendingCount": 0,
  "discountPendingCount": 0
}
```

### `AttributeOption`

Description: [NOT SPECIFIED]

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| attr | string | Yes | No | [NOT SPECIFIED] |
| label | string | Yes | No | [NOT SPECIFIED] |
| values | array of string | Yes | No | [NOT SPECIFIED] |

Constraints: Required: `attr`, `label`, `values`

Example (generated from schema):

```json
{
  "attr": "string",
  "label": "string",
  "values": [
    "string"
  ]
}
```

### `ChangeRequest`

Description: [NOT SPECIFIED]

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| comment | string | Yes | No | [NOT SPECIFIED] |
| requestedAt | string (format: date-time) | Yes | No | [NOT SPECIFIED] |

Constraints: Required: `requestedAt`, `comment`

Example (generated from schema):

```json
{
  "requestedAt": "2026-08-01T00:00:00.000Z",
  "comment": "string"
}
```

### `ComparisonRow`

Description: [NOT SPECIFIED]

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| current | string | Yes | No | [NOT SPECIFIED] |
| metric | string | Yes | No | [NOT SPECIFIED] |
| mlRec | string | Yes | No | [NOT SPECIFIED] |
| scenario | string | Yes | No | [NOT SPECIFIED] |

Constraints: Required: `metric`, `current`, `scenario`, `mlRec`

Example (generated from schema):

```json
{
  "metric": "string",
  "current": "string",
  "scenario": "string",
  "mlRec": "string"
}
```

### `ConditionGroupNode`

Description: [NOT SPECIFIED]

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| logic | string (enum: AND, OR) | Yes | No | [NOT SPECIFIED] |
| rules | array of `ConditionNode` | Yes | No | [NOT SPECIFIED] |
| type | string (enum: group) | Yes | No | [NOT SPECIFIED] |

Constraints: Required: `type`, `logic`, `rules`

Example (generated from schema):

```json
{
  "type": "group",
  "logic": "AND",
  "rules": [
    {
      "type": "rule",
      "attr": "string",
      "val": "string"
    }
  ]
}
```

### `ConditionNode`

Description: Recursive AND/OR condition tree. Enforced max depth is 3 (root group = depth 1), but ONLY on focus-sets create/update — not on POST /focus-sets/resolve.

This schema is a `oneOf` union (not a flat object):

- `ConditionRuleNode`
- `ConditionGroupNode`

Discriminator property: `type`

| Discriminator value | Schema |
|---|---|
| rule | `ConditionRuleNode` |
| group | `ConditionGroupNode` |

Constraints: [NOT SPECIFIED]

Example: [NOT SPECIFIED] (union type — see member schemas)

### `ConditionRuleNode`

Description: [NOT SPECIFIED]

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| attr | string | Yes | No | [NOT SPECIFIED] |
| type | string (enum: rule) | Yes | No | [NOT SPECIFIED] |
| val | string | Yes | No | [NOT SPECIFIED] |

Constraints: Required: `type`, `attr`, `val`

Example (generated from schema):

```json
{
  "type": "rule",
  "attr": "string",
  "val": "string"
}
```

### `CreateDiscountModelDto`

Description: [NOT SPECIFIED]

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| channel | string | Yes | No | [NOT SPECIFIED] |
| discountDepth | number | No | No | Optional. "bogo" format internally forces a fixed 0.5 rate regardless of this value. |
| discountFormat | string (enum: percentage, flat, bogo, fixed) | Yes | No | [NOT SPECIFIED] |
| endDate | string (format: date) | Yes | No | [NOT SPECIFIED] |
| focusGroupId | string | Yes | No | [NOT SPECIFIED] |
| name | string | Yes | No | [NOT SPECIFIED] |
| startDate | string (format: date) | Yes | No | [NOT SPECIFIED] |

Constraints: Required: `name`, `focusGroupId`, `startDate`, `endDate`, `discountFormat`, `channel`

Example (generated from schema):

```json
{
  "name": "string",
  "focusGroupId": "string",
  "startDate": "2026-08-01",
  "endDate": "2026-08-01",
  "discountFormat": "percentage",
  "discountDepth": 0,
  "channel": "string"
}
```

### `CreateGuardrailDto`

Description: [NOT SPECIFIED]

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| brand | string | Yes | No | [NOT SPECIFIED] |
| division | string | Yes | No | [NOT SPECIFIED] |
| op | string | Yes | No | [NOT SPECIFIED] |
| rule | string | Yes | No | [NOT SPECIFIED] |
| unit | string | Yes | No | [NOT SPECIFIED] |
| value | string | Yes | No | [NOT SPECIFIED] |

Constraints: Required: `brand`, `division`, `rule`, `op`, `value`, `unit`

Example (generated from schema):

```json
{
  "brand": "string",
  "division": "string",
  "rule": "string",
  "op": "string",
  "value": "string",
  "unit": "string"
}
```

### `CreatePromotionDto`

Description: [NOT SPECIFIED]

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| channel | string | Yes | No | [NOT SPECIFIED] |
| color | string | Yes | No | [NOT SPECIFIED] |
| discountType | string (enum: percentage, flat) | Yes | No | [NOT SPECIFIED] |
| discountValue | number | Yes | No | [NOT SPECIFIED] |
| endDate | string (format: date) | Yes | No | [NOT SPECIFIED] |
| focusSetId | string | Yes | No | [NOT SPECIFIED] |
| name | string | Yes | No | [NOT SPECIFIED] |
| notes | string | No | No | Optional; defaults to "" if omitted. |
| startDate | string (format: date) | Yes | No | [NOT SPECIFIED] |

Constraints: Required: `name`, `startDate`, `endDate`, `discountType`, `discountValue`, `focusSetId`, `channel`, `color`

Example (generated from schema):

```json
{
  "name": "string",
  "startDate": "2026-08-01",
  "endDate": "2026-08-01",
  "discountType": "percentage",
  "discountValue": 0,
  "focusSetId": "string",
  "channel": "string",
  "color": "string",
  "notes": "string"
}
```

### `CreateScenarioDto`

Description: [NOT SPECIFIED]

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| endDate | string (format: date) | Yes | No | [NOT SPECIFIED] |
| focusGroupId | string | Yes | No | [NOT SPECIFIED] |
| name | string | Yes | No | [NOT SPECIFIED] |
| objectives | `ScenarioObjectives` | Yes | No | [NOT SPECIFIED] |
| optimizationLevel | number | Yes | No | [NOT SPECIFIED] |
| startDate | string (format: date) | Yes | No | [NOT SPECIFIED] |

Constraints: Required: `name`, `focusGroupId`, `startDate`, `endDate`, `objectives`, `optimizationLevel`

Example (generated from schema):

```json
{
  "name": "string",
  "focusGroupId": "string",
  "startDate": "2026-08-01",
  "endDate": "2026-08-01",
  "objectives": {
    "revenue": 0,
    "grossMargin": 0,
    "sellThrough": 0
  },
  "optimizationLevel": 0
}
```

### `DecisionDto`

Description: Plain TS interface — zero runtime enum validation on `action`. Server-side, only "approve" and "deny" are matched explicitly; any other string (including a typo) is treated as "request_changes" and maps to status "returned".

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| action | string (enum: approve, deny, request_changes) | Yes | No | [NOT SPECIFIED] |
| comment | string | No | No | Required (non-empty after trim) for every action except "approve"; validated server-side before the id lookup runs, so 400 (missing comment) takes precedence over 404 (unknown id) when both conditions are true. |

Constraints: Required: `action`

Example (generated from schema):

```json
{
  "action": "approve",
  "comment": "string"
}
```

### `DeepDiveOutput`

Description: [NOT SPECIFIED]

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| discountTiles | array of `DiscountTile` | Yes | No | Always 5 entries (UNLOCK_LEVELS = [0,20,40,60,80]). |
| marketingTiles | array of `MarketingTile` | Yes | No | Always 5 entries (UNLOCK_LEVELS = [0,20,40,60,80]). |
| priceAdjustments | array of `SkuRecommendationRow` | Yes | No | Length is min(20, skuCount). |

Constraints: Required: `priceAdjustments`, `marketingTiles`, `discountTiles`

Example (generated from schema):

```json
{
  "priceAdjustments": [
    {
      "sku": "string",
      "productName": "string",
      "category": "string",
      "brand": "string",
      "currentPrice": 0,
      "recommendedPrice": 0,
      "priceChange": 0,
      "priceChangePct": 0,
      "currentGrossMargin": 0,
      "projectedGrossMargin": 0,
      "weeklyRevenue": 0,
      "projectedRevenue": 0,
      "currentWeeksOfSupply": 0,
      "projectedWeeksOfSupply": 0,
      "unlockLevel": 0
    }
  ],
  "marketingTiles": [
    {
      "id": "string",
      "campaign": "string",
      "type": "string",
      "discount": "string",
      "skuCount": 0,
      "projectedLift": "string",
      "unlockLevel": 0,
      "products": [
        {
          "sku": null,
          "productName": null,
          "currentPrice": null,
          "promoPrice": null
        }
      ]
    }
  ],
  "discountTiles": [
    {
      "id": "string",
      "name": "string",
      "type": "string",
      "depth": "string",
      "skuCount": 0,
      "projectedSellThrough": "string",
      "unlockLevel": 0,
      "products": [
        {
          "sku": null,
          "productName": null,
          "currentPrice": null,
          "discountedPrice": null
        }
      ]
    }
  ]
}
```

### `DiscountModelEntity`

Description: [NOT SPECIFIED]

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| channel | string | Yes | No | [NOT SPECIFIED] |
| createdAt | string (format: date-time) | Yes | No | [NOT SPECIFIED] |
| discountDepth | number | Yes | Yes | [NOT SPECIFIED] |
| discountFormat | string (enum: percentage, flat, bogo, fixed) | Yes | No | [NOT SPECIFIED] |
| endDate | string (format: date) | Yes | No | [NOT SPECIFIED] |
| focusGroupId | string | Yes | No | [NOT SPECIFIED] |
| focusGroupName | string | Yes | No | [NOT SPECIFIED] |
| id | integer | Yes | No | [NOT SPECIFIED] |
| marketingHandle | string | Yes | No | [NOT SPECIFIED] |
| name | string | Yes | No | [NOT SPECIFIED] |
| output | `DiscountModelOutput` | Yes | Yes | [NOT SPECIFIED] |
| skuCount | integer | Yes | No | [NOT SPECIFIED] |
| startDate | string (format: date) | Yes | No | [NOT SPECIFIED] |
| status | string (enum: new, draft, pending, approved, returned, denied) | Yes | No | [NOT SPECIFIED] |

Constraints: Required: `id`, `name`, `focusGroupId`, `focusGroupName`, `skuCount`, `startDate`, `endDate`, `discountFormat`, `discountDepth`, `channel`, `status`, `createdAt`, `marketingHandle`, `output`

Example (generated from schema):

```json
{
  "id": 0,
  "name": "string",
  "focusGroupId": "string",
  "focusGroupName": "string",
  "skuCount": 0,
  "startDate": "2026-08-01",
  "endDate": "2026-08-01",
  "discountFormat": "percentage",
  "discountDepth": 0,
  "channel": "string",
  "status": "new",
  "createdAt": "2026-08-01T00:00:00.000Z",
  "marketingHandle": "string",
  "output": {
    "narrative": "string",
    "marketingHandle": "string",
    "kpis": {
      "revenueImpact": 0,
      "marginImpact": 0,
      "unitLift": 0,
      "sellThrough": 0,
      "incrementalRevenue": 0
    },
    "forecastRevenue": [
      {
        "id": null,
        "data": null
      }
    ],
    "forecastMargin": [
      {
        "id": null,
        "data": null
      }
    ],
    "forecastUnits": [
      {
        "week": null,
        "Baseline": null,
        "Promoted": null
      }
    ],
    "rollupRows": [
      {
        "label": null,
        "skuCount": null,
        "revenue": null,
        "margin": null,
        "sellThrough": null,
        "stockOutRisk": null,
        "confidence": null
      }
    ],
    "riskPanels": [
      {
        "title": null,
        "severity": null,
        "description": null,
        "isHard": null
      }
    ]
  }
}
```

### `DiscountModelKpis`

Description: [NOT SPECIFIED]

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| incrementalRevenue | number | Yes | No | [NOT SPECIFIED] |
| marginImpact | number | Yes | No | [NOT SPECIFIED] |
| revenueImpact | number | Yes | No | [NOT SPECIFIED] |
| sellThrough | number | Yes | No | [NOT SPECIFIED] |
| unitLift | number | Yes | No | [NOT SPECIFIED] |

Constraints: Required: `revenueImpact`, `marginImpact`, `unitLift`, `sellThrough`, `incrementalRevenue`

Example (generated from schema):

```json
{
  "revenueImpact": 0,
  "marginImpact": 0,
  "unitLift": 0,
  "sellThrough": 0,
  "incrementalRevenue": 0
}
```

### `DiscountModelOutput`

Description: [NOT SPECIFIED]

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| forecastMargin | array of `NivoLineDataset` | Yes | No | Always 2 datasets ("Baseline", "Promoted"). |
| forecastRevenue | array of `NivoLineDataset` | Yes | No | Always 2 datasets ("Baseline", "Promoted"). |
| forecastUnits | array of `NivoBarDatapoint` | Yes | No | Always 8 entries (Wk 1..Wk 8). |
| kpis | `DiscountModelKpis` | Yes | No | [NOT SPECIFIED] |
| marketingHandle | string | Yes | No | [NOT SPECIFIED] |
| narrative | string | Yes | No | [NOT SPECIFIED] |
| riskPanels | array of `RiskPanel` | Yes | No | Always 6 entries (one per RISK_TEMPLATES). |
| rollupRows | array of `RollupRow` | Yes | No | Always 5 entries (one per RN_DIVISIONS). |

Constraints: Required: `narrative`, `marketingHandle`, `kpis`, `forecastRevenue`, `forecastMargin`, `forecastUnits`, `rollupRows`, `riskPanels`

Example (generated from schema):

```json
{
  "narrative": "string",
  "marketingHandle": "string",
  "kpis": {
    "revenueImpact": 0,
    "marginImpact": 0,
    "unitLift": 0,
    "sellThrough": 0,
    "incrementalRevenue": 0
  },
  "forecastRevenue": [
    {
      "id": "string",
      "data": [
        {
          "x": null,
          "y": null
        }
      ]
    }
  ],
  "forecastMargin": [
    {
      "id": "string",
      "data": [
        {
          "x": null,
          "y": null
        }
      ]
    }
  ],
  "forecastUnits": [
    {
      "week": "string",
      "Baseline": 0,
      "Promoted": 0
    }
  ],
  "rollupRows": [
    {
      "label": "string",
      "skuCount": 0,
      "revenue": 0,
      "margin": 0,
      "sellThrough": 0,
      "stockOutRisk": false,
      "confidence": 0
    }
  ],
  "riskPanels": [
    {
      "title": "string",
      "severity": "high",
      "description": "string",
      "isHard": false
    }
  ]
}
```

### `DiscountModelUpdateStatusDto`

Description: status is not runtime-validated against the enum; any string is accepted.

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| status | string (enum: new, draft, pending, approved, returned, denied) | Yes | No | [NOT SPECIFIED] |

Constraints: Required: `status`

Example (generated from schema):

```json
{
  "status": "new"
}
```

### `DiscountReviewView`

Description: ApprovalItemView (discount domain) plus review-only fields.

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| brand | string | Yes | No | v1 placeholder, paired with submitter. |
| changeRequests | array of `ChangeRequest` | Yes | No | scenario: ScenarioEntity.changeRequests, read through unmodified. discount: NOT from the underlying entity (which has no such field) — derived from ApprovalsService's own in-memory decision log, filtered to this item's action === "request_changes" entries. Lost on process restart in both the log and (for scenarios) the underlying in-memory store. |
| competitiveFlags | array of string | Yes | No | Always [] in v1 — no competitive-price integration exists. |
| constraintWarnings | array of string | Yes | No | Titles of output.riskPanels where severity !== "low". |
| division | string | Yes | No | v1 placeholder, paired with submitter. |
| domain | string (enum: scenario, discount) | Yes | No | [NOT SPECIFIED] |
| id | integer | Yes | No | The underlying ScenarioEntity.id or DiscountModelEntity.id. |
| impact | string | Yes | No | scenario: the "Rev Uplift" comparison-row value (e.g. "+12.3%"). discount: kpis.revenueImpact formatted as `(sign)$(rounded, thousands-separated)`. |
| name | string | Yes | No | [NOT SPECIFIED] |
| risk | string (enum: Low, Medium, High) | Yes | No | discount: High if any RiskPanel.isHard, else Medium if any panel exists, else Low. scenario: falls back to the existing "Inventory Risk" comparison-row value (Low/Medium/High) — there is no dedicated $ inventory-risk-reduction metric in the v1 placeholder engine, so REQ-APPR-011's literal $10M/$5M thresholds are NOT implemented as stated. |
| riskBanner | `DiscountRiskBanner` | Yes | No | [NOT SPECIFIED] |
| status | string (enum: pending, approved, denied, returned) | Yes | No | Mirrors the underlying entity's status field verbatim. |
| submitter | string | Yes | No | v1 placeholder — rotated from a fixed 3-entry roster by `id % 3`. Not real submitter identity. |
| team | string | Yes | No | v1 placeholder, paired with submitter. |

Constraints: Required: `domain`, `id`, `name`, `submitter`, `team`, `brand`, `division`, `impact`, `risk`, `status`, `changeRequests`, `riskBanner`, `constraintWarnings`, `competitiveFlags`

Example (generated from schema):

```json
{
  "domain": "scenario",
  "id": 0,
  "name": "string",
  "submitter": "string",
  "team": "string",
  "brand": "string",
  "division": "string",
  "impact": "string",
  "risk": "Low",
  "status": "pending",
  "changeRequests": [
    {
      "requestedAt": "2026-08-01T00:00:00.000Z",
      "comment": "string"
    }
  ],
  "riskBanner": {
    "hardCount": 0,
    "advisoryCount": 0
  },
  "constraintWarnings": [
    "string"
  ],
  "competitiveFlags": [
    "string"
  ]
}
```

### `DiscountRiskBanner`

Description: [NOT SPECIFIED]

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| advisoryCount | integer | Yes | No | Count of output.riskPanels where isHard === false AND severity !== "low". |
| hardCount | integer | Yes | No | Count of output.riskPanels where isHard === true (regardless of severity). |

Constraints: Required: `hardCount`, `advisoryCount`

Example (generated from schema):

```json
{
  "hardCount": 0,
  "advisoryCount": 0
}
```

### `DiscountTile`

Description: [NOT SPECIFIED]

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| depth | string | Yes | No | [NOT SPECIFIED] |
| id | string | Yes | No | [NOT SPECIFIED] |
| name | string | Yes | No | [NOT SPECIFIED] |
| products | array of `DiscountTileProduct` | Yes | No | [NOT SPECIFIED] |
| projectedSellThrough | string | Yes | No | [NOT SPECIFIED] |
| skuCount | integer | Yes | No | [NOT SPECIFIED] |
| type | string | Yes | No | [NOT SPECIFIED] |
| unlockLevel | number | Yes | No | [NOT SPECIFIED] |

Constraints: Required: `id`, `name`, `type`, `depth`, `skuCount`, `projectedSellThrough`, `unlockLevel`, `products`

Example (generated from schema):

```json
{
  "id": "string",
  "name": "string",
  "type": "string",
  "depth": "string",
  "skuCount": 0,
  "projectedSellThrough": "string",
  "unlockLevel": 0,
  "products": [
    {
      "sku": "string",
      "productName": "string",
      "currentPrice": 0,
      "discountedPrice": 0
    }
  ]
}
```

### `DiscountTileProduct`

Description: [NOT SPECIFIED]

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| currentPrice | number | Yes | No | [NOT SPECIFIED] |
| discountedPrice | number | Yes | No | [NOT SPECIFIED] |
| productName | string | Yes | No | [NOT SPECIFIED] |
| sku | string | Yes | No | [NOT SPECIFIED] |

Constraints: Required: `sku`, `productName`, `currentPrice`, `discountedPrice`

Example (generated from schema):

```json
{
  "sku": "string",
  "productName": "string",
  "currentPrice": 0,
  "discountedPrice": 0
}
```

### `ErrorResponse`

Description: Default Nest HttpException JSON shape (no custom exception filter observed).

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| error | string | No | No | [NOT SPECIFIED] |
| message | string \| array of string | Yes | No | [NOT SPECIFIED] |
| statusCode | integer | Yes | No | [NOT SPECIFIED] |

Constraints: Required: `statusCode`, `message`

Example (generated from schema):

```json
{
  "statusCode": 0,
  "message": "string",
  "error": "string"
}
```

### `EvaluateDto`

Description: [NOT SPECIFIED]

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| brand | string | Yes | No | [NOT SPECIFIED] |
| division | string | Yes | No | [NOT SPECIFIED] |
| metrics | object (map, values: number) | Yes | No | Keyed by guardrail `rule` name. |

Constraints: Required: `brand`, `division`, `metrics`

Example (generated from schema):

```json
{
  "brand": "string",
  "division": "string",
  "metrics": {
    "key": 0
  }
}
```

### `FocusSetBody`

Description: [NOT SPECIFIED]

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| filter | `ConditionNode` | Yes | No | [NOT SPECIFIED] |
| name | string | Yes | No | [NOT SPECIFIED] |

Constraints: Required: `name`, `filter`

Example (generated from schema):

```json
{
  "name": "string",
  "filter": {
    "type": "rule",
    "attr": "string",
    "val": "string"
  }
}
```

### `FocusSetView`

Description: [NOT SPECIFIED]

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| createdAt | string (format: date-time) | Yes | No | [NOT SPECIFIED] |
| filter | `ConditionNode` | Yes | No | [NOT SPECIFIED] |
| id | string | Yes | No | Format "focus-set-##" (zero-padded, sequential, per-process). |
| name | string | Yes | No | [NOT SPECIFIED] |
| productCount | integer | Yes | No | [NOT SPECIFIED] |

Constraints: Required: `id`, `name`, `filter`, `productCount`, `createdAt`

Example (generated from schema):

```json
{
  "id": "string",
  "name": "string",
  "filter": {
    "type": "rule",
    "attr": "string",
    "val": "string"
  },
  "productCount": 0,
  "createdAt": "2026-08-01T00:00:00.000Z"
}
```

### `FrontierPoint`

Description: [NOT SPECIFIED]

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| level | number | Yes | No | [NOT SPECIFIED] |
| profit | number | Yes | No | [NOT SPECIFIED] |
| revenue | number | Yes | No | [NOT SPECIFIED] |

Constraints: Required: `level`, `revenue`, `profit`

Example (generated from schema):

```json
{
  "level": 0,
  "revenue": 0,
  "profit": 0
}
```

### `GuardrailCheckResult`

Description: [NOT SPECIFIED]

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| actual | number | Yes | No | NaN if the corresponding metric was missing from the request. |
| id | integer | Yes | No | [NOT SPECIFIED] |
| isOverridable | boolean | Yes | No | [NOT SPECIFIED] |
| op | string | Yes | No | [NOT SPECIFIED] |
| passed | boolean | Yes | No | [NOT SPECIFIED] |
| rule | string | Yes | No | [NOT SPECIFIED] |
| severity | string (enum: hard, advisory) | Yes | No | advisory if isOverridable, else hard. |
| threshold | string | Yes | No | [NOT SPECIFIED] |
| unit | string | Yes | No | [NOT SPECIFIED] |

Constraints: Required: `id`, `rule`, `op`, `threshold`, `unit`, `actual`, `passed`, `isOverridable`, `severity`

Example (generated from schema):

```json
{
  "id": 0,
  "rule": "string",
  "op": "string",
  "threshold": "string",
  "unit": "string",
  "actual": 0,
  "passed": false,
  "isOverridable": false,
  "severity": "hard"
}
```

### `GuardrailEntity`

Description: [NOT SPECIFIED]

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| active | boolean | Yes | No | [NOT SPECIFIED] |
| brand | string | Yes | No | [NOT SPECIFIED] |
| division | string | Yes | No | [NOT SPECIFIED] |
| id | integer | Yes | No | [NOT SPECIFIED] |
| isOverridable | boolean | Yes | No | [NOT SPECIFIED] |
| op | string | Yes | No | [NOT SPECIFIED] |
| rule | string | Yes | No | [NOT SPECIFIED] |
| unit | string | Yes | No | [NOT SPECIFIED] |
| value | string | Yes | No | [NOT SPECIFIED] |

Constraints: Required: `id`, `brand`, `division`, `rule`, `op`, `value`, `unit`, `active`, `isOverridable`

Example (generated from schema):

```json
{
  "id": 0,
  "brand": "string",
  "division": "string",
  "rule": "string",
  "op": "string",
  "value": "string",
  "unit": "string",
  "active": false,
  "isOverridable": false
}
```

### `GuardrailEvaluationResult`

Description: [NOT SPECIFIED]

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| compliant | boolean | Yes | No | [NOT SPECIFIED] |
| results | array of `GuardrailCheckResult` | Yes | No | [NOT SPECIFIED] |

Constraints: Required: `compliant`, `results`

Example (generated from schema):

```json
{
  "compliant": false,
  "results": [
    {
      "id": 0,
      "rule": "string",
      "op": "string",
      "threshold": "string",
      "unit": "string",
      "actual": 0,
      "passed": false,
      "isOverridable": false,
      "severity": "hard"
    }
  ]
}
```

### `HealthStatus`

Description: [NOT SPECIFIED]

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| status | string | Yes | No | [NOT SPECIFIED] |

Constraints: Required: `status`

Example (generated from schema):

```json
{
  "status": "ok"
}
```

### `MarketingTile`

Description: [NOT SPECIFIED]

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| campaign | string | Yes | No | [NOT SPECIFIED] |
| discount | string | Yes | No | [NOT SPECIFIED] |
| id | string | Yes | No | [NOT SPECIFIED] |
| products | array of `MarketingTileProduct` | Yes | No | [NOT SPECIFIED] |
| projectedLift | string | Yes | No | [NOT SPECIFIED] |
| skuCount | integer | Yes | No | [NOT SPECIFIED] |
| type | string | Yes | No | [NOT SPECIFIED] |
| unlockLevel | number | Yes | No | [NOT SPECIFIED] |

Constraints: Required: `id`, `campaign`, `type`, `discount`, `skuCount`, `projectedLift`, `unlockLevel`, `products`

Example (generated from schema):

```json
{
  "id": "string",
  "campaign": "string",
  "type": "string",
  "discount": "string",
  "skuCount": 0,
  "projectedLift": "string",
  "unlockLevel": 0,
  "products": [
    {
      "sku": "string",
      "productName": "string",
      "currentPrice": 0,
      "promoPrice": 0
    }
  ]
}
```

### `MarketingTileProduct`

Description: [NOT SPECIFIED]

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| currentPrice | number | Yes | No | [NOT SPECIFIED] |
| productName | string | Yes | No | [NOT SPECIFIED] |
| promoPrice | number | Yes | No | [NOT SPECIFIED] |
| sku | string | Yes | No | [NOT SPECIFIED] |

Constraints: Required: `sku`, `productName`, `currentPrice`, `promoPrice`

Example (generated from schema):

```json
{
  "sku": "string",
  "productName": "string",
  "currentPrice": 0,
  "promoPrice": 0
}
```

### `NivoBarDatapoint`

Description: [NOT SPECIFIED]

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| Baseline | number | Yes | No | [NOT SPECIFIED] |
| Promoted | number | Yes | No | [NOT SPECIFIED] |
| week | string | Yes | No | [NOT SPECIFIED] |

Constraints: Required: `week`, `Baseline`, `Promoted`

Example (generated from schema):

```json
{
  "week": "string",
  "Baseline": 0,
  "Promoted": 0
}
```

### `NivoLineDatapoint`

Description: [NOT SPECIFIED]

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| x | string | Yes | No | [NOT SPECIFIED] |
| y | number | Yes | No | [NOT SPECIFIED] |

Constraints: Required: `x`, `y`

Example (generated from schema):

```json
{
  "x": "string",
  "y": 0
}
```

### `NivoLineDataset`

Description: [NOT SPECIFIED]

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| data | array of `NivoLineDatapoint` | Yes | No | [NOT SPECIFIED] |
| id | string | Yes | No | [NOT SPECIFIED] |

Constraints: Required: `id`, `data`

Example (generated from schema):

```json
{
  "id": "string",
  "data": [
    {
      "x": "string",
      "y": 0
    }
  ]
}
```

### `ProductGridView`

Description: [NOT SPECIFIED]

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| activeSkuCount | integer | Yes | No | [NOT SPECIFIED] |
| filter | `ConditionNode` | Yes | No | [NOT SPECIFIED] |
| focusSetId | string | Yes | No | [NOT SPECIFIED] |
| focusSetName | string | Yes | No | [NOT SPECIFIED] |
| products | array of `ProductRow` | Yes | No | [NOT SPECIFIED] |
| totalSkuCount | integer | Yes | No | [NOT SPECIFIED] |

Constraints: Required: `focusSetId`, `focusSetName`, `filter`, `products`, `totalSkuCount`, `activeSkuCount`

Example (generated from schema):

```json
{
  "focusSetId": "string",
  "focusSetName": "string",
  "filter": {
    "type": "rule",
    "attr": "string",
    "val": "string"
  },
  "products": [
    {
      "productId": "string",
      "productName": "string",
      "brand": "string",
      "division": "string",
      "category": "string",
      "skuCount": 0,
      "activeSkuCount": 0,
      "priceRange": [
        0,
        0
      ],
      "totalQty": 0,
      "stockStatus": "In_Stock",
      "skus": [
        {
          "sku": null,
          "productId": null,
          "productName": null,
          "name": null,
          "brand": null,
          "division": null,
          "category": null,
          "subClass": null,
          "msrp": null,
          "price": null,
          "qty": null,
          "onOrderQty": null,
          "status": null,
          "excluded": null
        }
      ]
    }
  ],
  "totalSkuCount": 0,
  "activeSkuCount": 0
}
```

### `ProductRow`

Description: [NOT SPECIFIED]

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| activeSkuCount | integer | Yes | No | [NOT SPECIFIED] |
| brand | string | Yes | No | [NOT SPECIFIED] |
| category | string | Yes | No | [NOT SPECIFIED] |
| division | string | Yes | No | [NOT SPECIFIED] |
| priceRange | array of number | Yes | No | Tuple [min, max]. |
| productId | string | Yes | No | [NOT SPECIFIED] |
| productName | string | Yes | No | [NOT SPECIFIED] |
| skuCount | integer | Yes | No | [NOT SPECIFIED] |
| skus | array of `SkuRow` | Yes | No | [NOT SPECIFIED] |
| stockStatus | string (enum: In_Stock, Low_Stock, Out_of_stock) | Yes | No | Worst-case across the product's SKUs (Out_of_stock > Low_Stock > In_Stock). |
| totalQty | integer | Yes | No | [NOT SPECIFIED] |

Constraints: Required: `productId`, `productName`, `brand`, `division`, `category`, `skuCount`, `activeSkuCount`, `priceRange`, `totalQty`, `stockStatus`, `skus`

Example (generated from schema):

```json
{
  "productId": "string",
  "productName": "string",
  "brand": "string",
  "division": "string",
  "category": "string",
  "skuCount": 0,
  "activeSkuCount": 0,
  "priceRange": [
    0,
    0
  ],
  "totalQty": 0,
  "stockStatus": "In_Stock",
  "skus": [
    {
      "sku": "string",
      "productId": "string",
      "productName": "string",
      "name": "string",
      "brand": "string",
      "division": "string",
      "category": "string",
      "subClass": "string",
      "msrp": 0,
      "price": 0,
      "qty": 0,
      "onOrderQty": 0,
      "status": "In_Stock",
      "excluded": false
    }
  ]
}
```

### `PromoProductRow`

Description: [NOT SPECIFIED]

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| brand | string | Yes | No | [NOT SPECIFIED] |
| name | string | Yes | No | [NOT SPECIFIED] |
| price | number | Yes | No | [NOT SPECIFIED] |
| promoPrice | number | Yes | No | Rounded to cents, floored at 0. |
| savings | number | Yes | No | round((price - promoPrice) * 100) / 100. |
| sku | string | Yes | No | [NOT SPECIFIED] |

Constraints: Required: `sku`, `name`, `brand`, `price`, `promoPrice`, `savings`

Example (generated from schema):

```json
{
  "sku": "string",
  "name": "string",
  "brand": "string",
  "price": 0,
  "promoPrice": 0,
  "savings": 0
}
```

### `PromoProductsView`

Description: [NOT SPECIFIED]

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| discountType | string (enum: percentage, flat) | Yes | No | [NOT SPECIFIED] |
| discountValue | number | Yes | No | [NOT SPECIFIED] |
| focusSetId | string | Yes | No | [NOT SPECIFIED] |
| focusSetName | string | Yes | No | [NOT SPECIFIED] |
| promotionId | integer | Yes | No | [NOT SPECIFIED] |
| promotionName | string | Yes | No | [NOT SPECIFIED] |
| skus | array of `PromoProductRow` | Yes | No | [NOT SPECIFIED] |

Constraints: Required: `promotionId`, `promotionName`, `discountType`, `discountValue`, `focusSetId`, `focusSetName`, `skus`

Example (generated from schema):

```json
{
  "promotionId": 0,
  "promotionName": "string",
  "discountType": "percentage",
  "discountValue": 0,
  "focusSetId": "string",
  "focusSetName": "string",
  "skus": [
    {
      "sku": "string",
      "name": "string",
      "brand": "string",
      "price": 0,
      "promoPrice": 0,
      "savings": 0
    }
  ]
}
```

### `PromotionEntity`

Description: [NOT SPECIFIED]

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| channel | string | Yes | No | [NOT SPECIFIED] |
| color | string | Yes | No | [NOT SPECIFIED] |
| discountType | string (enum: percentage, flat) | Yes | No | [NOT SPECIFIED] |
| discountValue | number | Yes | No | [NOT SPECIFIED] |
| endDate | string (format: date) | Yes | No | [NOT SPECIFIED] |
| focusSetId | string | Yes | No | [NOT SPECIFIED] |
| id | integer | Yes | No | [NOT SPECIFIED] |
| name | string | Yes | No | [NOT SPECIFIED] |
| notes | string | Yes | No | [NOT SPECIFIED] |
| startDate | string (format: date) | Yes | No | [NOT SPECIFIED] |
| status | string (enum: active, scheduled, expired) | Yes | No | Derived on every read from startDate/endDate vs today; not persisted. |

Constraints: Required: `id`, `name`, `startDate`, `endDate`, `discountType`, `discountValue`, `focusSetId`, `channel`, `color`, `notes`, `status`

Example (generated from schema):

```json
{
  "id": 0,
  "name": "string",
  "startDate": "2026-08-01",
  "endDate": "2026-08-01",
  "discountType": "percentage",
  "discountValue": 0,
  "focusSetId": "string",
  "channel": "string",
  "color": "string",
  "notes": "string",
  "status": "active"
}
```

### `Recommendation`

Description: [NOT SPECIFIED]

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| tag | string (enum: Pricing, Marketing, Merch, Inventory) | Yes | No | [NOT SPECIFIED] |
| text | string | Yes | No | [NOT SPECIFIED] |

Constraints: Required: `tag`, `text`

Example (generated from schema):

```json
{
  "tag": "Pricing",
  "text": "string"
}
```

### `ResolveResult`

Description: [NOT SPECIFIED]

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| count | integer | Yes | No | [NOT SPECIFIED] |
| skus | array of `SkuView` | Yes | No | [NOT SPECIFIED] |

Constraints: Required: `count`, `skus`

Example (generated from schema):

```json
{
  "count": 0,
  "skus": [
    {
      "sku": "string",
      "name": "string",
      "brand": "string",
      "division": "string",
      "category": "string",
      "price": 0,
      "qty": 0,
      "status": "string"
    }
  ]
}
```

### `RiskPanel`

Description: [NOT SPECIFIED]

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| description | string | Yes | No | [NOT SPECIFIED] |
| isHard | boolean | Yes | No | [NOT SPECIFIED] |
| severity | string (enum: high, medium, low) | Yes | No | [NOT SPECIFIED] |
| title | string | Yes | No | [NOT SPECIFIED] |

Constraints: Required: `title`, `severity`, `description`, `isHard`

Example (generated from schema):

```json
{
  "title": "string",
  "severity": "high",
  "description": "string",
  "isHard": false
}
```

### `RollupRow`

Description: [NOT SPECIFIED]

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| confidence | number | Yes | No | [NOT SPECIFIED] |
| label | string | Yes | No | [NOT SPECIFIED] |
| margin | number | Yes | No | [NOT SPECIFIED] |
| revenue | number | Yes | No | [NOT SPECIFIED] |
| sellThrough | number | Yes | No | [NOT SPECIFIED] |
| skuCount | integer | Yes | No | [NOT SPECIFIED] |
| stockOutRisk | boolean | Yes | No | [NOT SPECIFIED] |

Constraints: Required: `label`, `skuCount`, `revenue`, `margin`, `sellThrough`, `stockOutRisk`, `confidence`

Example (generated from schema):

```json
{
  "label": "string",
  "skuCount": 0,
  "revenue": 0,
  "margin": 0,
  "sellThrough": 0,
  "stockOutRisk": false,
  "confidence": 0
}
```

### `ScenarioEntity`

Description: [NOT SPECIFIED]

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| changeRequests | array of `ChangeRequest` | Yes | No | [NOT SPECIFIED] |
| createdAt | string (format: date-time) | Yes | No | [NOT SPECIFIED] |
| endDate | string (format: date) | Yes | No | [NOT SPECIFIED] |
| focusGroupId | string | Yes | No | [NOT SPECIFIED] |
| focusGroupName | string | Yes | No | [NOT SPECIFIED] |
| id | integer | Yes | No | [NOT SPECIFIED] |
| name | string | Yes | No | [NOT SPECIFIED] |
| objectives | `ScenarioObjectives` | Yes | No | [NOT SPECIFIED] |
| optimizationLevel | number | Yes | No | [NOT SPECIFIED] |
| output | `ScenarioOutput` | Yes | Yes | [NOT SPECIFIED] |
| skuCount | integer | Yes | No | [NOT SPECIFIED] |
| startDate | string (format: date) | Yes | No | [NOT SPECIFIED] |
| status | string (enum: new, draft, pending, approved, denied, returned) | Yes | No | [NOT SPECIFIED] |

Constraints: Required: `id`, `name`, `focusGroupId`, `focusGroupName`, `skuCount`, `startDate`, `endDate`, `objectives`, `optimizationLevel`, `status`, `createdAt`, `changeRequests`, `output`

Example (generated from schema):

```json
{
  "id": 0,
  "name": "string",
  "focusGroupId": "string",
  "focusGroupName": "string",
  "skuCount": 0,
  "startDate": "2026-08-01",
  "endDate": "2026-08-01",
  "objectives": {
    "revenue": 0,
    "grossMargin": 0,
    "sellThrough": 0
  },
  "optimizationLevel": 0,
  "status": "new",
  "createdAt": "2026-08-01T00:00:00.000Z",
  "changeRequests": [
    {
      "requestedAt": "2026-08-01T00:00:00.000Z",
      "comment": "string"
    }
  ],
  "output": {
    "narrative": "string",
    "uncertainty": "string",
    "guardrailResults": [
      {
        "id": null,
        "rule": null,
        "op": null,
        "threshold": null,
        "unit": null,
        "actual": null,
        "passed": null,
        "isOverridable": null,
        "severity": null
      }
    ],
    "comparison": [
      {
        "metric": null,
        "current": null,
        "scenario": null,
        "mlRec": null
      }
    ],
    "frontier": [
      {
        "level": null,
        "revenue": null,
        "profit": null
      }
    ],
    "currentPoint": {
      "level": 0,
      "revenue": 0,
      "profit": 0
    },
    "mlRecPoint": {
      "level": 0,
      "revenue": 0,
      "profit": 0
    },
    "scenarioPoint": {
      "level": 0,
      "revenue": 0,
      "profit": 0
    },
    "recommendations": [
      {
        "tag": null,
        "text": null
      }
    ]
  }
}
```

### `ScenarioGuardrailCheck`

Description: [NOT SPECIFIED]

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| actual | number | Yes | No | [NOT SPECIFIED] |
| id | integer | Yes | No | [NOT SPECIFIED] |
| isOverridable | boolean | Yes | No | [NOT SPECIFIED] |
| op | string | Yes | No | [NOT SPECIFIED] |
| passed | boolean | Yes | No | [NOT SPECIFIED] |
| rule | string | Yes | No | [NOT SPECIFIED] |
| severity | string (enum: hard, advisory) | Yes | No | [NOT SPECIFIED] |
| threshold | string | Yes | No | [NOT SPECIFIED] |
| unit | string | Yes | No | [NOT SPECIFIED] |

Constraints: Required: `id`, `rule`, `op`, `threshold`, `unit`, `actual`, `passed`, `isOverridable`, `severity`

Example (generated from schema):

```json
{
  "id": 0,
  "rule": "string",
  "op": "string",
  "threshold": "string",
  "unit": "string",
  "actual": 0,
  "passed": false,
  "isOverridable": false,
  "severity": "hard"
}
```

### `ScenarioObjectives`

Description: [NOT SPECIFIED]

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| grossMargin | number | Yes | No | [NOT SPECIFIED] |
| revenue | number | Yes | No | [NOT SPECIFIED] |
| sellThrough | number | Yes | No | [NOT SPECIFIED] |

Constraints: Required: `revenue`, `grossMargin`, `sellThrough`

Example (generated from schema):

```json
{
  "revenue": 0,
  "grossMargin": 0,
  "sellThrough": 0
}
```

### `ScenarioOutput`

Description: [NOT SPECIFIED]

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| comparison | array of `ComparisonRow` | Yes | No | Always 7 rows. |
| currentPoint | `FrontierPoint` | Yes | No | [NOT SPECIFIED] |
| frontier | array of `FrontierPoint` | Yes | No | Always 11 points (levels 0,10,...,100). |
| guardrailResults | array of `ScenarioGuardrailCheck` | Yes | No | Only currently-active guardrails. |
| mlRecPoint | `FrontierPoint` | Yes | No | [NOT SPECIFIED] |
| narrative | string | Yes | No | [NOT SPECIFIED] |
| recommendations | array of `Recommendation` | Yes | No | Always exactly 4 entries (sliced from 6 templates). |
| scenarioPoint | `FrontierPoint` | Yes | No | level equals the optimizationLevel set at scenario creation. |
| uncertainty | string | Yes | No | Always contains a "±" character. |

Constraints: Required: `narrative`, `uncertainty`, `guardrailResults`, `comparison`, `frontier`, `currentPoint`, `mlRecPoint`, `scenarioPoint`, `recommendations`

Example (generated from schema):

```json
{
  "narrative": "string",
  "uncertainty": "string",
  "guardrailResults": [
    {
      "id": 0,
      "rule": "string",
      "op": "string",
      "threshold": "string",
      "unit": "string",
      "actual": 0,
      "passed": false,
      "isOverridable": false,
      "severity": "hard"
    }
  ],
  "comparison": [
    {
      "metric": "string",
      "current": "string",
      "scenario": "string",
      "mlRec": "string"
    }
  ],
  "frontier": [
    {
      "level": 0,
      "revenue": 0,
      "profit": 0
    }
  ],
  "currentPoint": {
    "level": 0,
    "revenue": 0,
    "profit": 0
  },
  "mlRecPoint": {
    "level": 0,
    "revenue": 0,
    "profit": 0
  },
  "scenarioPoint": {
    "level": 0,
    "revenue": 0,
    "profit": 0
  },
  "recommendations": [
    {
      "tag": "Pricing",
      "text": "string"
    }
  ]
}
```

### `ScenarioReviewView`

Description: ApprovalItemView (scenario domain) plus the full SLICE-07 output, reused as-is.

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| brand | string | Yes | No | v1 placeholder, paired with submitter. |
| changeRequests | array of `ChangeRequest` | Yes | No | scenario: ScenarioEntity.changeRequests, read through unmodified. discount: NOT from the underlying entity (which has no such field) — derived from ApprovalsService's own in-memory decision log, filtered to this item's action === "request_changes" entries. Lost on process restart in both the log and (for scenarios) the underlying in-memory store. |
| division | string | Yes | No | v1 placeholder, paired with submitter. |
| domain | string (enum: scenario, discount) | Yes | No | [NOT SPECIFIED] |
| id | integer | Yes | No | The underlying ScenarioEntity.id or DiscountModelEntity.id. |
| impact | string | Yes | No | scenario: the "Rev Uplift" comparison-row value (e.g. "+12.3%"). discount: kpis.revenueImpact formatted as `(sign)$(rounded, thousands-separated)`. |
| name | string | Yes | No | [NOT SPECIFIED] |
| output | `ScenarioOutput` | Yes | No | [NOT SPECIFIED] |
| risk | string (enum: Low, Medium, High) | Yes | No | discount: High if any RiskPanel.isHard, else Medium if any panel exists, else Low. scenario: falls back to the existing "Inventory Risk" comparison-row value (Low/Medium/High) — there is no dedicated $ inventory-risk-reduction metric in the v1 placeholder engine, so REQ-APPR-011's literal $10M/$5M thresholds are NOT implemented as stated. |
| status | string (enum: pending, approved, denied, returned) | Yes | No | Mirrors the underlying entity's status field verbatim. |
| submitter | string | Yes | No | v1 placeholder — rotated from a fixed 3-entry roster by `id % 3`. Not real submitter identity. |
| team | string | Yes | No | v1 placeholder, paired with submitter. |

Constraints: Required: `domain`, `id`, `name`, `submitter`, `team`, `brand`, `division`, `impact`, `risk`, `status`, `changeRequests`, `output`

Example (generated from schema):

```json
{
  "domain": "scenario",
  "id": 0,
  "name": "string",
  "submitter": "string",
  "team": "string",
  "brand": "string",
  "division": "string",
  "impact": "string",
  "risk": "Low",
  "status": "pending",
  "changeRequests": [
    {
      "requestedAt": "2026-08-01T00:00:00.000Z",
      "comment": "string"
    }
  ],
  "output": {
    "narrative": "string",
    "uncertainty": "string",
    "guardrailResults": [
      {
        "id": null,
        "rule": null,
        "op": null,
        "threshold": null,
        "unit": null,
        "actual": null,
        "passed": null,
        "isOverridable": null,
        "severity": null
      }
    ],
    "comparison": [
      {
        "metric": null,
        "current": null,
        "scenario": null,
        "mlRec": null
      }
    ],
    "frontier": [
      {
        "level": null,
        "revenue": null,
        "profit": null
      }
    ],
    "currentPoint": {
      "level": 0,
      "revenue": 0,
      "profit": 0
    },
    "mlRecPoint": {
      "level": 0,
      "revenue": 0,
      "profit": 0
    },
    "scenarioPoint": {
      "level": 0,
      "revenue": 0,
      "profit": 0
    },
    "recommendations": [
      {
        "tag": null,
        "text": null
      }
    ]
  }
}
```

### `ScenarioUpdateStatusDto`

Description: status is not runtime-validated against the enum; any string is accepted.

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| comment | string | No | No | Optional. Only has an effect if status is "returned": a non-empty comment appends a ChangeRequest entry. |
| status | string (enum: new, draft, pending, approved, denied, returned) | Yes | No | [NOT SPECIFIED] |

Constraints: Required: `status`

Example (generated from schema):

```json
{
  "status": "new",
  "comment": "string"
}
```

### `SkuRecommendationRow`

Description: [NOT SPECIFIED]

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| brand | string | Yes | No | [NOT SPECIFIED] |
| category | string | Yes | No | [NOT SPECIFIED] |
| currentGrossMargin | number | Yes | No | [NOT SPECIFIED] |
| currentPrice | number | Yes | No | [NOT SPECIFIED] |
| currentWeeksOfSupply | number | Yes | No | [NOT SPECIFIED] |
| priceChange | number | Yes | No | [NOT SPECIFIED] |
| priceChangePct | number | Yes | No | [NOT SPECIFIED] |
| productName | string | Yes | No | [NOT SPECIFIED] |
| projectedGrossMargin | number | Yes | No | [NOT SPECIFIED] |
| projectedRevenue | number | Yes | No | [NOT SPECIFIED] |
| projectedWeeksOfSupply | number | Yes | No | [NOT SPECIFIED] |
| recommendedPrice | number | Yes | No | [NOT SPECIFIED] |
| sku | string | Yes | No | [NOT SPECIFIED] |
| unlockLevel | number | Yes | No | Minimum optimization level (0-100) required to surface this row. |
| weeklyRevenue | number | Yes | No | [NOT SPECIFIED] |

Constraints: Required: `sku`, `productName`, `category`, `brand`, `currentPrice`, `recommendedPrice`, `priceChange`, `priceChangePct`, `currentGrossMargin`, `projectedGrossMargin`, `weeklyRevenue`, `projectedRevenue`, `currentWeeksOfSupply`, `projectedWeeksOfSupply`, `unlockLevel`

Example (generated from schema):

```json
{
  "sku": "string",
  "productName": "string",
  "category": "string",
  "brand": "string",
  "currentPrice": 0,
  "recommendedPrice": 0,
  "priceChange": 0,
  "priceChangePct": 0,
  "currentGrossMargin": 0,
  "projectedGrossMargin": 0,
  "weeklyRevenue": 0,
  "projectedRevenue": 0,
  "currentWeeksOfSupply": 0,
  "projectedWeeksOfSupply": 0,
  "unlockLevel": 0
}
```

### `SkuRow`

Description: [NOT SPECIFIED]

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| brand | string | Yes | No | [NOT SPECIFIED] |
| category | string | Yes | No | [NOT SPECIFIED] |
| division | string | Yes | No | [NOT SPECIFIED] |
| excluded | boolean | Yes | No | [NOT SPECIFIED] |
| msrp | number | Yes | Yes | [NOT SPECIFIED] |
| name | string | Yes | No | [NOT SPECIFIED] |
| onOrderQty | integer | Yes | No | [NOT SPECIFIED] |
| price | number | Yes | No | [NOT SPECIFIED] |
| productId | string | Yes | No | [NOT SPECIFIED] |
| productName | string | Yes | No | [NOT SPECIFIED] |
| qty | integer | Yes | No | [NOT SPECIFIED] |
| sku | string | Yes | No | [NOT SPECIFIED] |
| status | string (enum: In_Stock, Low_Stock, Out_of_stock) | Yes | No | [NOT SPECIFIED] |
| subClass | string | Yes | No | [NOT SPECIFIED] |

Constraints: Required: `sku`, `productId`, `productName`, `name`, `brand`, `division`, `category`, `subClass`, `msrp`, `price`, `qty`, `onOrderQty`, `status`, `excluded`

Example (generated from schema):

```json
{
  "sku": "string",
  "productId": "string",
  "productName": "string",
  "name": "string",
  "brand": "string",
  "division": "string",
  "category": "string",
  "subClass": "string",
  "msrp": 0,
  "price": 0,
  "qty": 0,
  "onOrderQty": 0,
  "status": "In_Stock",
  "excluded": false
}
```

### `SkuView`

Description: [NOT SPECIFIED]

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| brand | string | Yes | No | [NOT SPECIFIED] |
| category | string | Yes | No | [NOT SPECIFIED] |
| division | string | Yes | No | [NOT SPECIFIED] |
| name | string | Yes | No | [NOT SPECIFIED] |
| price | number | Yes | No | [NOT SPECIFIED] |
| qty | integer | Yes | No | [NOT SPECIFIED] |
| sku | string | Yes | No | [NOT SPECIFIED] |
| status | string | Yes | No | [NOT SPECIFIED] |

Constraints: Required: `sku`, `name`, `brand`, `division`, `category`, `price`, `qty`, `status`

Example (generated from schema):

```json
{
  "sku": "string",
  "name": "string",
  "brand": "string",
  "division": "string",
  "category": "string",
  "price": 0,
  "qty": 0,
  "status": "string"
}
```

### `UpdateGuardrailDto`

Description: All fields optional; server only assigns fields that are not undefined (partial update).

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| brand | string | No | No | [NOT SPECIFIED] |
| division | string | No | No | [NOT SPECIFIED] |
| op | string | No | No | [NOT SPECIFIED] |
| rule | string | No | No | [NOT SPECIFIED] |
| unit | string | No | No | [NOT SPECIFIED] |
| value | string | No | No | [NOT SPECIFIED] |

Constraints: [NOT SPECIFIED]

Example (generated from schema):

```json
{
  "brand": "string",
  "division": "string",
  "rule": "string",
  "op": "string",
  "value": "string",
  "unit": "string"
}
```

### `UpdatePromotionDto`

Description: All fields optional; partial update.

| Field | Type | Required | Nullable | Description |
|---|---|---|---|---|
| channel | string | No | No | [NOT SPECIFIED] |
| color | string | No | No | [NOT SPECIFIED] |
| discountType | string (enum: percentage, flat) | No | No | [NOT SPECIFIED] |
| discountValue | number | No | No | [NOT SPECIFIED] |
| endDate | string (format: date) | No | No | [NOT SPECIFIED] |
| focusSetId | string | No | No | [NOT SPECIFIED] |
| name | string | No | No | [NOT SPECIFIED] |
| notes | string | No | No | [NOT SPECIFIED] |
| startDate | string (format: date) | No | No | [NOT SPECIFIED] |

Constraints: [NOT SPECIFIED]

Example (generated from schema):

```json
{
  "name": "string",
  "startDate": "2026-08-01",
  "endDate": "2026-08-01",
  "discountType": "percentage",
  "discountValue": 0,
  "focusSetId": "string",
  "channel": "string",
  "color": "string",
  "notes": "string"
}
```

## Notes and Gaps

- This document is mechanically generated from `backend/contracts/api-contract.yaml`; any `[NOT SPECIFIED]` above reflects a genuine absence in that YAML, not an omission during conversion.
- All "Example" blocks under Endpoints and Schemas are schema-shaped examples generated from the OpenAPI schema (types/enums/formats), not real captured request/response payloads — the source YAML does not embed literal examples.
- Endpoints with no documented error responses in the YAML are marked `[NOT SPECIFIED]` under Error Responses, not assumed to have none.
- See the YAML file's own `x-global-behavior` and `x-source-snapshot` notes (info block) for cross-cutting behavior (no global validation pipe, permissive CORS, ParseIntPipe usage, etc.) not repeated per-endpoint here.

