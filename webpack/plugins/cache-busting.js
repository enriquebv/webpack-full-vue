const pluginName = "CacheBustingPlugin";
const fs = require("fs");
const Path = require("path");

const FS_ENCODING = { encoding: "utf8" };

class CacheBustingPlugin {
  constructor(options = {}) {
    this.mode = options.mode || "hashfile";
    this.envPath = options.envPath || Path.resolve(process.cwd(), ".env");
    this.envName = options.envName || "ASSETS_HASH";
    this.injectPath = options.injectPath;
  }

  apply(compiler) {
    compiler.hooks.afterEmit.tap(pluginName, compilation => {
      const { mode } = this;
      const { hash } = compilation;

      if (typeof mode === "string") this.applyMode(mode, hash);
      if (mode instanceof Array)
        mode.forEach(singleMode => this.applyMode(singleMode, hash));
    });
  }

  applyMode(mode, hash) {
    switch (mode) {
      case "hashfile":
        this.writeHashFile(hash);
        return;
      case "env":
        this.writeEnv(hash);
        return;
      default:
        throw new Error(
          `Mode "${mode}" not exists in plugin CacheBustingPlugin.`
        );
    }
  }

  // Create a file with the
  writeHashFile(hash) {
    fs.writeFileSync(
      Path.resolve(process.cwd(), ".bundlehash"),
      hash,
      FS_ENCODING
    );
  }

  // Create or update an .env to include the hash as enviroment variable
  writeEnv(hash) {
    const { envPath, envName } = this;

    if (!fs.existsSync(envPath)) {
      fs.writeFileSync(envPath, `${envName}=${hash}`, FS_ENCODING);
      return;
    }

    const content = fs.readFileSync(envPath, FS_ENCODING);
    const envMap = content.split("\n").reduce((acc, line) => {
      const [name, value] = line.split("=");

      acc[name] = value;
      return acc;
    }, {});
    const haveVariable = Object.keys(envMap).includes(envName);
    let modified;

    if (haveVariable) {
      modified = Object.keys(envMap)
        .reduce((acc, key) => {
          acc.push(
            key === envName ? `${envName}=${hash}` : `${key}=${envMap[key]}`
          );
          return acc;
        }, [])
        .join("\n");
    }

    if (!haveVariable) {
      modified = Object.keys(envMap).reduce((acc, key) => {
        acc.push(`${key}=${envMap[key]}`);
        return acc;
      }, []);
      modified.push(`${envName}=${hash}`);
      modified = modified.join("\n");
    }

    if (modified === undefined) {
      throw new Error(
        ".env file can't be updated with CacheBustingPlugin hash."
      );
    }

    fs.writeFileSync(envPath, modified, FS_ENCODING);
    return;
  }
}

module.exports = CacheBustingPlugin;
