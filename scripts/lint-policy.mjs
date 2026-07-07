// Retail Nucleus backend policy gate.
// Fails if a forbidden library appears in dependencies. The backend owns Tier-1
// *Entity records and API contracts; keep the dependency surface disciplined.
import { readFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const rootDir = dirname(fileURLToPath(import.meta.url))

const FORBIDDEN = ["express-session", "body-parser", "typeorm-naming-strategies"]

const pkg = JSON.parse(readFileSync(join(rootDir, "..", "package.json")))
const declared = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) }

const errors = FORBIDDEN.filter((n) => declared[n]).map(
  (n) => `Forbidden dependency in package.json: ${n}`,
)

if (errors.length) {
  console.error("lint:policy FAILED:\n" + errors.map((e) => "  - " + e).join("\n"))
  process.exit(1)
}
console.log("lint:policy OK — backend dependency policy verified.")
