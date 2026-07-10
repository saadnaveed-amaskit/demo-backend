import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post } from "@nestjs/common"
import { MeasurementService } from "./measurement.service"
import type { MoveClusterDto } from "./measurement-types"

@Controller("measurement")
export class MeasurementController {
  constructor(private readonly service: MeasurementService) {}

  @Get("experiments")
  listExperiments() {
    return this.service.listExperiments()
  }

  @Get("experiments/:id")
  getExperiment(@Param("id", ParseIntPipe) id: number) {
    return this.service.getExperiment(id)
  }

  @Post("experiments/:id/clusters/:clusterId/move")
  @HttpCode(HttpStatus.OK)
  moveCluster(
    @Param("id", ParseIntPipe) id: number,
    @Param("clusterId", ParseIntPipe) clusterId: number,
    @Body() dto: MoveClusterDto,
  ) {
    return this.service.moveCluster(id, clusterId, dto)
  }

  @Post("experiments/:id/acknowledge-cost")
  @HttpCode(HttpStatus.OK)
  acknowledgeCost(@Param("id", ParseIntPipe) id: number) {
    return this.service.acknowledgeCost(id)
  }

  @Post("experiments/:id/go-live")
  @HttpCode(HttpStatus.OK)
  goLive(@Param("id", ParseIntPipe) id: number) {
    return this.service.goLive(id)
  }

  @Post("experiments/:id/scale")
  @HttpCode(HttpStatus.OK)
  scale(@Param("id", ParseIntPipe) id: number) {
    return this.service.scale(id)
  }

  @Post("experiments/:id/kill")
  @HttpCode(HttpStatus.OK)
  kill(@Param("id", ParseIntPipe) id: number) {
    return this.service.kill(id)
  }
}
