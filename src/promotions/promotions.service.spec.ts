import { Test } from "@nestjs/testing"
import { BadRequestException, NotFoundException } from "@nestjs/common"
import { PromotionsService } from "./promotions.service"
import { FocusSetsService } from "../focus-sets/focus-sets.service"

const daysAgo = (n: number) =>
  new Date(Date.now() - n * 86400000).toISOString().slice(0, 10)
const daysAhead = (n: number) =>
  new Date(Date.now() + n * 86400000).toISOString().slice(0, 10)

describe("PromotionsService", () => {
  let service: PromotionsService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [PromotionsService, FocusSetsService],
    }).compile()
    service = module.get(PromotionsService)
  })

  it("starts with an empty store", () => {
    expect(service.findAll()).toHaveLength(0)
  })

  it("create adds a promotion and derives status", () => {
    const p = service.create({
      name: "Summer Sale",
      startDate: daysAgo(5),
      endDate: daysAhead(10),
      discountType: "percentage",
      discountValue: 20,
      focusSetId: "",
      channel: "US",
      color: "#0d9488",
    })
    expect(p.id).toBe(1)
    expect(p.status).toBe("active")
  })

  it("create derives status=scheduled for future start", () => {
    const p = service.create({
      name: "Fall Launch",
      startDate: daysAhead(5),
      endDate: daysAhead(15),
      discountType: "flat",
      discountValue: 5,
      focusSetId: "",
      channel: "US",
      color: "#7c3aed",
    })
    expect(p.status).toBe("scheduled")
  })

  it("create derives status=expired for past end", () => {
    const p = service.create({
      name: "Old Sale",
      startDate: daysAgo(20),
      endDate: daysAgo(5),
      discountType: "percentage",
      discountValue: 10,
      focusSetId: "",
      channel: "CA",
      color: "#dc2626",
    })
    expect(p.status).toBe("expired")
  })

  it("create throws BadRequestException when end <= start", () => {
    expect(() =>
      service.create({
        name: "Bad",
        startDate: daysAhead(10),
        endDate: daysAhead(5),
        discountType: "percentage",
        discountValue: 10,
        focusSetId: "",
        channel: "US",
        color: "#fff",
      }),
    ).toThrow(BadRequestException)
  })

  it("update changes name field", () => {
    service.create({
      name: "Promo A",
      startDate: daysAgo(5),
      endDate: daysAhead(5),
      discountType: "percentage",
      discountValue: 10,
      focusSetId: "",
      channel: "US",
      color: "#fff",
    })
    const updated = service.update(1, { name: "Promo B" })
    expect(updated.name).toBe("Promo B")
  })

  it("update throws NotFoundException for unknown id", () => {
    expect(() => service.update(999, { name: "X" })).toThrow(NotFoundException)
  })

  it("remove deletes a promotion", () => {
    service.create({
      name: "Del",
      startDate: daysAgo(1),
      endDate: daysAhead(1),
      discountType: "flat",
      discountValue: 2,
      focusSetId: "",
      channel: "US",
      color: "#fff",
    })
    service.remove(1)
    expect(service.findAll()).toHaveLength(0)
  })

  it("getProducts throws NotFoundException when promotion not found", () => {
    expect(() => service.getProducts(999)).toThrow(NotFoundException)
  })

  it("getProducts throws NotFoundException when focus set not found", () => {
    service.create({
      name: "Linked",
      startDate: daysAgo(1),
      endDate: daysAhead(1),
      discountType: "percentage",
      discountValue: 20,
      focusSetId: "nonexistent-fs",
      channel: "US",
      color: "#fff",
    })
    expect(() => service.getProducts(1)).toThrow(NotFoundException)
  })
})
