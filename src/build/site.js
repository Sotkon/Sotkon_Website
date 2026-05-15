const fs = require("fs");
const path = require("path");
const { products } = require("../data/products");
const { renderProductPage } = require("../templates/productPage");

const root = path.resolve(__dirname, "../..");
const outputs = ["docs", "sotkon_redesign"];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyFile(source, target) {
  ensureDir(path.dirname(target));
  fs.copyFileSync(source, target);
}

function copyDir(source, target) {
  ensureDir(target);
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const from = path.join(source, entry.name);
    const to = path.join(target, entry.name);
    if (entry.isDirectory()) {
      copyDir(from, to);
    } else {
      copyFile(from, to);
    }
  }
}

function writeFile(target, content) {
  ensureDir(path.dirname(target));
  fs.writeFileSync(target, content);
}

function buildOutput(output) {
  const outputRoot = path.join(root, output);
  copyFile(path.join(root, "src/static/styles.css"), path.join(outputRoot, "styles.css"));
  copyFile(path.join(root, "src/static/script.js"), path.join(outputRoot, "script.js"));

  if (output === "sotkon_redesign") {
    copyFile(path.join(root, "src/static/server.js"), path.join(outputRoot, "server.js"));
  }

  for (const product of products) {
    writeFile(
      path.join(outputRoot, "en/waste-systems", product.slug, "index.html"),
      renderProductPage(product),
    );
  }
}

for (const output of outputs) {
  buildOutput(output);
}

console.log(`Built ${products.length} product pages into ${outputs.join(" and ")}.`);
