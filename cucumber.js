module.exports = {
  default: {
    paths: ["tests/features/**/*.feature"],
    require: ["tests/register.js", "tests/support/**/*.ts", "tests/steps/**/*.ts"],
    format: ["progress"],
  },
}
