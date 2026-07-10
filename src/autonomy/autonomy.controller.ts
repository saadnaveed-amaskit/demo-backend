import { Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post } from "@nestjs/common"
import { AutonomyService } from "./autonomy.service"

@Controller("autonomy")
export class AutonomyController {
  constructor(private readonly service: AutonomyService) {}

  @Get("roster")
  getRoster() {
    return this.service.getRoster()
  }

  @Get("action-classes/:id/audit")
  getAudit(@Param("id", ParseIntPipe) id: number) {
    return this.service.getAudit(id)
  }

  @Post("action-classes/:id/promote")
  @HttpCode(HttpStatus.OK)
  promote(@Param("id", ParseIntPipe) id: number) {
    return this.service.promote(id)
  }

  @Post("action-classes/:id/demote")
  @HttpCode(HttpStatus.OK)
  demote(@Param("id", ParseIntPipe) id: number) {
    return this.service.demote(id)
  }

  @Post("live-actions/:id/veto")
  @HttpCode(HttpStatus.OK)
  veto(@Param("id", ParseIntPipe) id: number) {
    return this.service.veto(id)
  }

  @Post("live-actions/:id/undo")
  @HttpCode(HttpStatus.OK)
  undo(@Param("id", ParseIntPipe) id: number) {
    return this.service.undo(id)
  }

  @Post("kill-switch/engage")
  @HttpCode(HttpStatus.OK)
  engageKillSwitch() {
    return this.service.engageKillSwitch()
  }

  @Post("kill-switch/disengage")
  @HttpCode(HttpStatus.OK)
  disengageKillSwitch() {
    return this.service.disengageKillSwitch()
  }
}
