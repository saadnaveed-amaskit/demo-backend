import { Controller, Get } from "@nestjs/common"

interface HealthStatus {
  status: string
}

@Controller("health")
export class HealthController {
  @Get()
  check(): HealthStatus {
    return { status: "ok" }
  }
}
