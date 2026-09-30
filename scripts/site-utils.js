const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const crypto = require("node:crypto");

function filesIn(root, relative = "") {
  return fs
    .readdirSync(path.join(root, relative), { withFileTypes: true })
    .flatMap((entry) => {
      const name = path.posix.join(relative, entry.name);
      return entry.isDirectory() ? filesIn(root, name) : [name];
    })
    .sort();
}

function snapshot(root) {
  return Object.fromEntries(
    filesIn(root).map((file) => {
      let data = fs.readFileSync(path.join(root, file));
      if (/\.(html|css|js|md|json)$/.test(file))
        data = Buffer.from(data.toString().replace(/\r\n/g, "\n"));
      return [file, crypto.createHash("sha256").update(data).digest("hex")];
    }),
  );
}

function temporarySite() {
  const base = fs.realpathSync(os.tmpdir());
  const directory = fs.mkdtempSync(path.join(base, "sotkon-check-"));
  return {
    directory,
    cleanup() {
      const resolved = path.resolve(directory);
      if (
        path.dirname(resolved) !== base ||
        !path.basename(resolved).startsWith("sotkon-check-")
      )
        throw new Error("Unsafe temporary directory");
      fs.rmSync(resolved, { recursive: true, force: true });
    },
  };
}

module.exports = { filesIn, snapshot, temporarySite };
