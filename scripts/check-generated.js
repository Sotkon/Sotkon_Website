const path = require("node:path");
const { buildSite } = require("../src/build/site");
const { temporarySite, snapshot } = require("./site-utils");

async function checkGenerated() {
  const temp = temporarySite();
  try {
    await buildSite(temp.directory);
    const expected = snapshot(temp.directory);
    const actual = snapshot(path.resolve(__dirname, "../docs"));
    const differences = [
      ...new Set([...Object.keys(expected), ...Object.keys(actual)]),
    ].filter((file) => expected[file] !== actual[file]);
    if (differences.length)
      throw new Error(
        `Generated output differs. Run npm run build and remove obsolete generated files:\n${differences.join("\n")}`,
      );
    console.log("docs matches a clean build.");
  } finally {
    temp.cleanup();
  }
}

checkGenerated().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
