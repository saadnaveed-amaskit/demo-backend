import { Test, TestingModule } from "@nestjs/testing"
import { BadRequestException, NotFoundException } from "@nestjs/common"
import { DiscountModelingController } from "./discount-modeling.controller"
import { DiscountModelingService } from "./discount-modeling.service"
import { FocusSetsService } from "../focus-sets/focus-sets.service"

const BASE_DTO = {
  name: "Test Model",
  focusGroupId: "",
  startDate: "2026-08-01",
  endDate: "2026-08-14",
  discountFormat: "percentage" as const,
  discountDepth: 15,
  channel: "digital",
}

describe("DiscountModelingController", () => {
  let controller: DiscountModelingController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiscountModelingController],
      providers: [DiscountModelingService, FocusSetsService],
    }).compile()
    controller = module.get(DiscountModelingController)
  })

  it("findAll returns empty array initially", () => {
    expect(controller.findAll()).toEqual([])
  })

  it("create returns a model with status new", () => {
    const m = controller.create(BASE_DTO)
    expect(m.status).toBe("new")
    expect(m.output).toBeNull()
  })

  it("run produces output", () => {
    const m = controller.create(BASE_DTO)
    const ran = controller.run(m.id)
    expect(ran.status).toBe("draft")
    expect(ran.output).not.toBeNull()
  })

  it("submit requires draft status", () => {
    const m = controller.create(BASE_DTO)
    expect(() => controller.submit(m.id)).toThrow(BadRequestException)
  })

  it("submit transitions draft to pending", () => {
    const m = controller.create(BASE_DTO)
    controller.run(m.id)
    const submitted = controller.submit(m.id)
    expect(submitted.status).toBe("pending")
  })

  it("updateStatus sets arbitrary status", () => {
    const m = controller.create(BASE_DTO)
    const updated = controller.updateStatus(m.id, { status: "approved" })
    expect(updated.status).toBe("approved")
  })

  it("remove deletes the model (no return value)", () => {
    const m = controller.create(BASE_DTO)
    expect(() => controller.remove(m.id)).not.toThrow()
    expect(controller.findAll()).toHaveLength(0)
  })

  it("findOne throws NotFoundException for missing id", () => {
    expect(() => controller.findOne(999)).toThrow(NotFoundException)
  })
})
