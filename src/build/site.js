const fs = require("node:fs");
const path = require("node:path");
const { products } = require("../data/products");
const pages = require("../data/pages.json");
const { renderProductPage } = require("../templates/productPage");
const { pageShell } = require("../templates/layout");
const { prepareImages, enhanceImages } = require("./images");

const root = path.resolve(__dirname, "../..");

function copyTree(source, target) {
  fs.mkdirSync(target, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const from = path.join(source, entry.name);
    const to = path.join(target, entry.name);
    if (entry.isDirectory()) copyTree(from, to);
    else fs.copyFileSync(from, to);
  }
}

async function buildSite(outputRoot = path.join(root, "docs")) {
  copyTree(path.join(root, "public"), outputRoot);
  const images = await prepareImages(
    path.join(root, "public/assets"),
    path.join(outputRoot, "assets"),
  );
  for (const name of ["styles.css", "script.js"]) {
    fs.copyFileSync(
      path.join(root, "src/static", name),
      path.join(outputRoot, name),
    );
  }
  const rendered = pages.map(({ route, title, description }) => ({
    route,
    html: pageShell({
      title,
      description,
      body: fs.readFileSync(path.join(root, "src/pages", route), "utf8"),
      depth: "../".repeat(route.split("/").length - 1) || "./",
    }),
  }));
  for (const product of products) {
    rendered.push({
      route: `en/waste-systems/${product.slug}/index.html`,
      html: renderProductPage(product),
    });
  }
  const routes = new Set();
  for (const { route, html } of rendered) {
    if (routes.has(route) || !/^(?:[a-z0-9-]+\/)*index\.html$/.test(route)) {
      throw new Error(`Invalid or duplicate route: ${route}`);
    }
    routes.add(route);
    const target = path.join(outputRoot, route);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(
      target,
      enhanceImages(html, images).replace(/\r\n/g, "\n"),
    );
  }
  return {
    pages: routes.size,
    optimizedImages: [...images.values()].filter((image) => image.optimized)
      .length,
  };
}

if (require.main === module) {
  buildSite()
    .then((result) =>
      console.log(
        `Built ${result.pages} pages; ${result.optimizedImages} optimized images.`,
      ),
    )
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}

module.exports = { buildSite };
