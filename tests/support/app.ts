import { Test } from "@nestjs/testing"
import type { INestApplication } from "@nestjs/common"
import { AppModule } from "../../src/app.module"

let app: INestApplication | undefined

/** Boots (once) an in-process Nest application for backend API Cucumber scenarios to exercise directly via supertest, without binding a port. */
export async function getApp(): Promise<INestApplication> {
  if (!app) {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile()
    app = moduleRef.createNestApplication()
    await app.init()
  }
  return app
}

export async function closeApp(): Promise<void> {
  if (app) {
    await app.close()
    app = undefined
  }
}
