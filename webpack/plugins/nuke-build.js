const pluginName = "NukeBuildPlugin";
const fs = require("fs");
const Path = require("path");

class NukeBuildPlugin {
  apply(compiler) {
    compiler.hooks.shouldEmit.tap(pluginName, compilation => {
      const { options } = compilation;
      fs.readdirSync(options.output.path).forEach(file =>
        fs.unlinkSync(Path.resolve(options.output.path, file))
      );

      return true;
    });
  }
}

module.exports = NukeBuildPlugin;
