const Path = require("path");
const CacheBustingPlugin = require("./webpack/plugins/cache-busting");
const NukeBuildPlugin = require("./webpack/plugins/nuke-build");
const common = require("./webpack/common");
const { SourceMapDevToolPlugin } = require("webpack");

const port = 1234;
const build = process.argv.includes("--build");

const entryFiles = {
  app: Path.resolve(__dirname, "./src/app.js")
};
const outputPath = Path.resolve(__dirname, "./dist");

const cacheBustingConfig = {
  mode: "env"
};

const config = {
  entry: entryFiles,
  mode: build ? "production" : "development",
  watch: !build,
  output: {
    path: outputPath,
    filename: "[name].[hash].js"
  },
  module: {
    rules: [...common.rules]
  },
  plugins: [
    new CacheBustingPlugin(cacheBustingConfig),
    new NukeBuildPlugin(),
    new SourceMapDevToolPlugin({
      filename: "[name].[hash].js.map"
    })
  ]
};

if (!build) {
  config.devServer = {
    contentBase: outputPath,
    hot: true
  };
}

module.exports = config;
