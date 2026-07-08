import { FocusSetsService } from "./focus-sets.service"

describe("FocusSetsService", () => {
  let service: FocusSetsService

  beforeEach(() => {
    service = new FocusSetsService()
  })

  it("resolves an empty filter to all catalog SKUs (REQ-FOCUS-010)", () => {
    const { count, skus } = service.resolve({ type: "group", logic: "AND", rules: [] })
    expect(count).toBeGreaterThan(0)
    expect(skus.length).toBe(count)
  })

  it("resolves an exact-equality rule (REQ-FOCUS-010)", () => {
    const { skus } = service.resolve({
      type: "group",
      logic: "AND",
      rules: [{ type: "rule", attr: "brand", val: "Gymboree" }],
    })
    expect(skus.length).toBeGreaterThan(0)
    expect(skus.every((s) => s.brand === "Gymboree")).toBe(true)
  })

  it("supports nested AND/OR groups", () => {
    const { skus } = service.resolve({
      type: "group",
      logic: "AND",
      rules: [
        { type: "rule", attr: "division", val: "BIG GIRLS" },
        {
          type: "group",
          logic: "OR",
          rules: [
            { type: "rule", attr: "brand", val: "TCP" },
            { type: "rule", attr: "brand", val: "Gymboree" },
          ],
        },
      ],
    })
    expect(skus.every((s) => s.division === "BIG GIRLS")).toBe(true)
  })

  it("returns zero matches for an impossible filter (no min-match enforcement)", () => {
    const { count } = service.resolve({
      type: "group",
      logic: "AND",
      rules: [{ type: "rule", attr: "brand", val: "NoSuchBrand" }],
    })
    expect(count).toBe(0)
  })

  it("creates a Focus Set with an auto-incremented focus-set-## id (REQ-FOCUS-011)", () => {
    const a = service.create({ name: "A", filter: { type: "group", logic: "AND", rules: [] } })
    const b = service.create({ name: "B", filter: { type: "group", logic: "AND", rules: [] } })
    expect(a.id).toMatch(/^focus-set-\d+$/)
    expect(b.id).not.toEqual(a.id)
    expect(service.findAll().length).toBe(2)
  })

  it("edits in place preserving id (REQ-FOCUS-005)", () => {
    const created = service.create({ name: "Orig", filter: { type: "group", logic: "AND", rules: [] } })
    const updated = service.update(created.id, {
      name: "Renamed",
      filter: { type: "group", logic: "AND", rules: [{ type: "rule", attr: "brand", val: "TCP" }] },
    })
    expect(updated.id).toBe(created.id)
    expect(updated.name).toBe("Renamed")
  })

  it("duplicates a set under a new name inheriting the filter (REQ-FOCUS-006)", () => {
    const created = service.create({
      name: "Base",
      filter: { type: "group", logic: "AND", rules: [{ type: "rule", attr: "brand", val: "TCP" }] },
    })
    const copy = service.duplicate(created.id, "Copy")
    expect(copy.id).not.toBe(created.id)
    expect(copy.name).toBe("Copy")
    expect(copy.filter).toEqual(created.filter)
  })

  it("derives productCount live from the filter", () => {
    const created = service.create({
      name: "Gym only",
      filter: { type: "group", logic: "AND", rules: [{ type: "rule", attr: "brand", val: "Gymboree" }] },
    })
    const view = service.findAll().find((f) => f.id === created.id)!
    const resolved = service.resolve(created.filter)
    expect(view.productCount).toBe(resolved.count)
  })

  it("deletes a set (REQ-FOCUS-007)", () => {
    const created = service.create({ name: "Temp", filter: { type: "group", logic: "AND", rules: [] } })
    expect(service.remove(created.id)).toBe(true)
    expect(service.findAll().length).toBe(0)
  })
})
