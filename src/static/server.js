const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = Number(process.env.PORT || 5173);

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
};

function sendFile(response, filePath) {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "content-type": types[path.extname(filePath).toLowerCase()] || "application/octet-stream",
    });
    response.end(data);
  });
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://localhost:${port}`);
  const decodedPath = decodeURIComponent(url.pathname);
  const requestedPath = decodedPath === "/"
    ? "/index.html"
    : decodedPath.endsWith("/")
      ? `${decodedPath}index.html`
      : decodedPath;
  const filePath = requestedPath.startsWith("/sotkon_extracted/")
    ? path.resolve(root, "..", `.${requestedPath}`)
    : path.resolve(root, `.${requestedPath}`);

  const extractedRoot = path.resolve(root, "..", "sotkon_extracted");
  const isAllowedRedesignFile = filePath.startsWith(root);
  const isAllowedExtractedAsset = filePath.startsWith(extractedRoot);

  if (!isAllowedRedesignFile && !isAllowedExtractedAsset) {
    response.writeHead(403, { "content-type": "text/plain; charset=utf-8" });
    response.end("Forbidden");
    return;
  }

  sendFile(response, filePath);
});

server.listen(port, () => {
  console.log(`Sotkon redesign running at http://localhost:${port}`);
});
