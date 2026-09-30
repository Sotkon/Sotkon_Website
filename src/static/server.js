const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
};

function isWithin(root, target) {
  const relative = path.relative(root, target);
  return (
    relative !== ".." &&
    !relative.startsWith(`..${path.sep}`) &&
    !path.isAbsolute(relative)
  );
}

function createServer(root = path.resolve(__dirname, "../../docs")) {
  root = path.resolve(root);
  return http.createServer(async (request, response) => {
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    response.setHeader("Cache-Control", "no-cache");
    const fail = (code, message) => {
      response.writeHead(code, { "content-type": "text/plain; charset=utf-8" });
      response.end(message);
    };
    if (!["GET", "HEAD"].includes(request.method)) {
      response.setHeader("Allow", "GET, HEAD");
      fail(405, "Method not allowed");
      return;
    }
    let pathname;
    try {
      // Decode before normalization so traversal attempts cannot be erased by URL parsing.
      pathname = decodeURIComponent(request.url.split("?")[0]);
    } catch {
      fail(400, "Bad request");
      return;
    }
    if (
      !pathname.startsWith("/") ||
      pathname.startsWith("//") ||
      pathname.includes("\\") ||
      [...pathname].some((character) => character.charCodeAt(0) < 32) ||
      pathname.split("/").some((segment) => segment.startsWith("."))
    ) {
      fail(403, "Forbidden");
      return;
    }
    if (pathname.endsWith("/")) pathname += "index.html";
    const file = path.resolve(root, `.${pathname}`);
    if (!isWithin(root, file)) {
      fail(403, "Forbidden");
      return;
    }
    try {
      const realFile = await fs.realpath(file);
      const realRoot = await fs.realpath(root);
      if (!isWithin(realRoot, realFile)) {
        fail(403, "Forbidden");
        return;
      }
      const stat = await fs.stat(realFile);
      if (stat.isDirectory()) {
        response.writeHead(301, { Location: `${encodeURI(pathname)}/` });
        response.end();
        return;
      }
      const type = types[path.extname(realFile).toLowerCase()];
      if (!type) {
        fail(403, "Forbidden");
        return;
      }
      const data =
        request.method === "HEAD" ? null : await fs.readFile(realFile);
      response.writeHead(200, {
        "content-type": type,
        "content-length": stat.size,
      });
      response.end(data);
    } catch (error) {
      if (["ENOENT", "ENOTDIR", "EACCES"].includes(error.code))
        fail(404, "Not found");
      else {
        console.error(error);
        fail(500, "Internal error");
      }
    }
  });
}

if (require.main === module) {
  const port = Number(process.env.PORT || 5173);
  createServer().listen(port, "127.0.0.1", () =>
    console.log(`Sotkon preview: http://127.0.0.1:${port}`),
  );
}

module.exports = { createServer, isWithin };
