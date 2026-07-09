import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post } from "@nestjs/common"
import { AgentsService } from "./agents.service"
import type { HireDto } from "./agent-types"

@Controller("agents")
export class AgentsController {
  constructor(private readonly service: AgentsService) {}

  @Get("roster")
  getRoster() {
    return this.service.getRoster()
  }

  @Get("catalog")
  getCatalog() {
    return this.service.getCatalog()
  }

  @Post("monitors/:id/pause")
  @HttpCode(HttpStatus.OK)
  pauseMonitor(@Param("id", ParseIntPipe) id: number) {
    return this.service.pauseMonitor(id)
  }

  @Post("monitors/:id/resume")
  @HttpCode(HttpStatus.OK)
  resumeMonitor(@Param("id", ParseIntPipe) id: number) {
    return this.service.resumeMonitor(id)
  }

  @Post("hire")
  hire(@Body() dto: HireDto) {
    return this.service.hire(dto)
  }

  @Post("task-agents/:id/retire")
  @HttpCode(HttpStatus.OK)
  retireTaskAgent(@Param("id", ParseIntPipe) id: number) {
    return this.service.retireTaskAgent(id)
  }
}
