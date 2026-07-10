// Registers ts-node (real TypeScript compiler, not esbuild) so backend Cucumber
// step/support files compile with emitDecoratorMetadata intact -- required for
// NestJS's reflection-based dependency injection to resolve constructor params.
require("ts-node").register({
  project: require("path").join(__dirname, "..", "tsconfig.tests.json"),
  transpileOnly: true,
})
