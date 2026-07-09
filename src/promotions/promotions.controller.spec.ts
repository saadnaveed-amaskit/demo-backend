import { Test, TestingModule } from "@nestjs/testing"
import { BadRequestException, NotFoundException } from "@nestjs/common"
import { PromotionsController } from "./promotions.controller"
import { PromotionsService } from "./promotions.service"
import { FocusSetsService } from "../focus-sets/focus-sets.service"

const daysAgo = (n: number) =>
  new Date(Date.now() - n * 86400000).toISOString().slice(0, 10)
const daysAhead = (n: number) =>
  new Date(Date.now() + n * 86400000).toISOString().slice(0, 10)

describe("PromotionsController", () => {
  let controller: PromotionsController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PromotionsController],
      providers: [PromotionsService, FocusSetsService],
    }).compile()

    controller = module.get(PromotionsController)
  })

  it("findAll returns empty array initially", () => {
    expect(controller.findAll()).toEqual([])
  })

  it("create returns a promotion with derived status", () => {
    const p = controller.create({
      name: "Test Sale",
      startDate: daysAgo(3),
      endDate: daysAhead(7),
      discountType: "percentage",
      discountValue: 15,
      focusSetId: "",
      channel: "US",
      color: "#0d9488",
    })
    expect(p.name).toBe("Test Sale")
    expect(p.status).toBe("active")
  })

  it("create throws BadRequestException for invalid dates", () => {
    expect(() =>
      controller.create({
        name: "Bad",
        startDate: daysAhead(10),
        endDate: daysAhead(5),
        discountType: "flat",
        discountValue: 5,
        focusSetId: "",
        channel: "US",
        color: "#fff",
      }),
    ).toThrow(BadRequestException)
  })

  it("update changes promotion fields", () => {
    controller.create({
      name: "Old Name",
      startDate: daysAgo(1),
      endDate: daysAhead(5),
      discountType: "percentage",
      discountValue: 10,
      focusSetId: "",
      channel: "US",
      color: "#fff",
    })
    const updated = controller.update(1, { name: "New Name" })
    expect(updated.name).toBe("New Name")
  })

  it("update throws NotFoundException for unknown id", () => {
    expect(() => controller.update(999, { name: "X" })).toThrow(NotFoundException)
  })

  it("remove deletes a promotion without returning content", () => {
    controller.create({
      name: "To Delete",
      startDate: daysAgo(1),
      endDate: daysAhead(1),
      discountType: "flat",
      discountValue: 2,
      focusSetId: "",
      channel: "US",
      color: "#fff",
    })
    expect(() => controller.remove(1)).not.toThrow()
    expect(controller.findAll()).toHaveLength(0)
  })

  it("getProducts throws NotFoundException for unknown promotion", () => {
    expect(() => controller.getProducts(999)).toThrow(NotFoundException)
  })
})
