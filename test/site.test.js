const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { buildSite } = require("../src/build/site");
const { validateSite } = require("../scripts/validate-site");
const { snapshot, temporarySite } = require("../scripts/site-utils");
const { createServer } = require("../src/static/server");
const { renderProductPage } = require("../src/templates/productPage");
const { products } = require("../src/data/products");

test("clean build contains the complete site and repeats deterministically", async () => {
  const temp = temporarySite();
  try {
    const built = await buildSite(temp.directory);
    assert.equal(built.pages, 20);
    assert.deepEqual(validateSite(temp.directory).errors, []);
    const first = snapshot(temp.directory);
    await buildSite(temp.directory);
    assert.deepEqual(snapshot(temp.directory), first);
    const homepage = fs.readFileSync(
      path.join(temp.directory, "index.html"),
      "utf8",
    );
    assert.match(homepage, /loading="lazy"/);
    assert.match(homepage, /\.webp/);
  } finally {
    temp.cleanup();
  }
});

test("product text and metadata cannot inject HTML or attributes", () => {
  const payload = '"><script>alert(1)</script>&';
  const product = structuredClone(products[0]);
  product.name = payload;
  product.description = payload;
  product.components[0].text = [payload];
  product.components[0].images[0][1] = payload;
  const html = renderProductPage(product);
  assert.ok(!html.includes(payload));
  assert.ok(!html.includes("<script>alert(1)</script>"));
  assert.match(html, /&quot;&gt;&lt;script&gt;/);
  assert.ok(!html.includes("&amp;quot;"));
});

test("local preview rejects traversal, malformed paths and unsupported methods", async () => {
  const temp = temporarySite();
  const root = path.join(temp.directory, "site");
  fs.mkdirSync(root);
  fs.writeFileSync(path.join(root, "index.html"), "<h1>Fixture</h1>");
  fs.writeFileSync(path.join(temp.directory, "private.html"), "secret");
  fs.writeFileSync(path.join(root, ".env"), "secret");
  const server = createServer(root);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  function request(requestPath, method = "GET") {
    return new Promise((resolve, reject) => {
      const req = http.request(
        {
          hostname: "127.0.0.1",
          port: server.address().port,
          path: requestPath,
          method,
        },
        (response) => {
          const chunks = [];
          response.on("data", (chunk) => chunks.push(chunk));
          response.on("end", () =>
            resolve({
              status: response.statusCode,
              headers: response.headers,
              body: Buffer.concat(chunks).toString(),
            }),
          );
        },
      );
      req.on("error", reject);
      req.end();
    });
  }
  try {
    assert.equal((await request("/")).status, 200);
    assert.equal((await request("/", "HEAD")).body, "");
    assert.equal((await request("/", "POST")).status, 405);
    for (const bad of [
      "/../private.html",
      "/..%2Fprivate.html",
      "/%2e%2e%5cprivate.html",
      "/.env",
      "/%00",
      "//other-host/",
    ])
      assert.equal((await request(bad)).status, 403, bad);
    assert.equal((await request("/%zz")).status, 400);
    assert.equal((await request("/missing")).status, 404);
    const healthy = await request("/");
    assert.equal(healthy.status, 200);
    assert.equal(healthy.headers["x-content-type-options"], "nosniff");
    // A junction/symlink within the served directory must not expose its sibling.
    fs.symlinkSync(
      temp.directory,
      path.join(root, "outside"),
      process.platform === "win32" ? "junction" : "dir",
    );
    assert.equal((await request("/outside/private.html")).status, 403);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    temp.cleanup();
  }
});

test("validator detects broken links, fragments and animation frames", () => {
  const temp = temporarySite();
  try {
    fs.writeFileSync(
      path.join(temp.directory, "index.html"),
      '<h1>Fixture</h1><a href="#missing">Link</a><img src="absent.jpg" data-sequence-base="frames/" data-sequence-count="2">',
    );
    const result = validateSite(temp.directory);
    assert.ok(result.errors.some((error) => error.includes("missing anchor")));
    assert.ok(result.errors.some((error) => error.includes("absent.jpg")));
    assert.ok(result.errors.some((error) => error.includes("frames/2.jpg")));
  } finally {
    temp.cleanup();
  }
});
