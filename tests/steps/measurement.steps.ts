import { BeforeAll, AfterAll, Given, When, Then } from "@cucumber/cucumber"
import { strict as assert } from "node:assert"
import request from "supertest"
import { getApp, closeApp } from "../support/app"

// Anticipated backend surface for SLICE-12 (Measurement) -- not yet implemented.
// This test exercises the backend API directly (in-process, via supertest
// against the Nest application instance -- no frontend UI involved) ahead of
// implementation, per acceptance-test-first. See
// knowledge/specs/001-platform-baseline/validation/SLICE-12-preparation.md.
//
// Seed data assumed once the module is implemented:
//   experiment 1 = setup, has >=1 imbalanced block, cost not acknowledged
//   experiment 2 = setup, all blocks balanced, cost not yet acknowledged,
//                  has >=1 treatment cluster with an mlPrice
//   experiment 3 = live, win-probability already >= the win boundary

let response: request.Response
let experimentId: number
let clusterId: number

BeforeAll(async () => {
  await getApp()
})

AfterAll(async () => {
  await closeApp()
})

// ---------------------------------------------------------------------------
// Scenario: Go-live is blocked when a block is imbalanced
// ---------------------------------------------------------------------------

Given("an experiment with at least one imbalanced block", async () => {
  const app = await getApp()
  const res = await request(app.getHttpServer()).get("/measurement/experiments/1")
  assert.equal(res.status, 200, `Expected seeded experiment 1 to exist, got status ${res.status}`)
  const blocks = (res.body?.blocks ?? []) as Array<{ status: string }>
  assert.ok(blocks.some((b) => b.status === "Imbalanced"), "Expected seeded experiment 1 to have an imbalanced block")
  experimentId = 1
})

When("I request to go live", async () => {
  const app = await getApp()
  response = await request(app.getHttpServer()).post(`/measurement/experiments/${experimentId}/go-live`)
})

Then("the response status is {int}", (status: number) => {
  assert.equal(response.status, status, `Expected status ${status}, got ${response.status}`)
})

Then("the response body has a non-empty blocked reason", () => {
  const message = response.body?.message
  assert.ok(typeof message === "string" && message.trim().length > 0, "Expected a non-empty blocked reason in the response body")
})

// ---------------------------------------------------------------------------
// Scenario: Go-live succeeds once all blocks are balanced and cost is acknowledged
// ---------------------------------------------------------------------------

Given("an experiment with all blocks balanced", async () => {
  const app = await getApp()
  const res = await request(app.getHttpServer()).get("/measurement/experiments/2")
  assert.equal(res.status, 200, `Expected seeded experiment 2 to exist, got status ${res.status}`)
  const blocks = (res.body?.blocks ?? []) as Array<{ status: string }>
  assert.ok(blocks.length > 0 && blocks.every((b) => b.status === "Balanced"), "Expected seeded experiment 2 to have all blocks balanced")
  experimentId = 2
})

When("I acknowledge the cost of control", async () => {
  const app = await getApp()
  response = await request(app.getHttpServer()).post(`/measurement/experiments/${experimentId}/acknowledge-cost`)
})

Then("the experiment status is {string}", (status: string) => {
  assert.equal(response.body?.status, status, `Expected experiment status "${status}", got "${response.body?.status}"`)
})

// ---------------------------------------------------------------------------
// Scenario: Moving a cluster to control clears its ML price recommendation
// ---------------------------------------------------------------------------

Given("a treatment cluster with an ML price recommendation", async () => {
  const app = await getApp()
  const res = await request(app.getHttpServer()).get("/measurement/experiments/2")
  assert.equal(res.status, 200, `Expected seeded experiment 2 to exist, got status ${res.status}`)
  const blocks = (res.body?.blocks ?? []) as Array<{ clusters: Array<{ id: number; arm: string; mlPrice: number | null }> }>
  const cluster = blocks.flatMap((b) => b.clusters).find((c) => c.arm === "treatment" && c.mlPrice !== null)
  assert.ok(cluster, "Expected seeded experiment 2 to have a treatment cluster with an mlPrice")
  experimentId = 2
  clusterId = cluster!.id
})

When("I move the cluster to control", async () => {
  const app = await getApp()
  response = await request(app.getHttpServer())
    .post(`/measurement/experiments/${experimentId}/clusters/${clusterId}/move`)
    .send({ arm: "control" })
})

Then("the cluster's arm is {string}", (arm: string) => {
  assert.equal(response.body?.arm, arm, `Expected cluster arm "${arm}", got "${response.body?.arm}"`)
})

Then("the cluster's mlPrice is null", () => {
  assert.equal(response.body?.mlPrice, null, `Expected cluster mlPrice to be null, got ${JSON.stringify(response.body?.mlPrice)}`)
})

// ---------------------------------------------------------------------------
// Scenario: A live experiment reports a win verdict once its win-probability crosses the boundary
// ---------------------------------------------------------------------------

Given("a live experiment whose win-probability is above the win boundary", async () => {
  experimentId = 3
})

When("I request the experiment", async () => {
  const app = await getApp()
  response = await request(app.getHttpServer()).get(`/measurement/experiments/${experimentId}`)
})

Then("the readout verdict is {string}", (verdict: string) => {
  assert.equal(response.body?.readout?.verdict, verdict, `Expected readout verdict "${verdict}", got "${response.body?.readout?.verdict}"`)
})
