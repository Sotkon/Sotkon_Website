const fs = require("node:fs");
const path = require("node:path");
const { parse } = require("parse5");
const { filesIn } = require("./site-utils");
const { isWithin } = require("../src/static/server");

function nodesIn(node) {
  return [node, ...(node.childNodes || []).flatMap(nodesIn)];
}

function validateSite(root = path.resolve(__dirname, "../docs")) {
  const errors = [];
  const htmlFiles = filesIn(root).filter((file) => file.endsWith(".html"));
  const documents = new Map();
  for (const file of htmlFiles) {
    const nodes = nodesIn(
      parse(fs.readFileSync(path.join(root, file), "utf8")),
    );
    const ids = new Set();
    for (const node of nodes) {
      node.attributes = Object.fromEntries(
        (node.attrs || []).map((attr) => [attr.name, attr.value]),
      );
      const id = node.attributes.id;
      if (id && ids.has(id)) errors.push(`${file}: duplicate id ${id}`);
      if (id) ids.add(id);
      if (
        node.tagName === "img" &&
        (!("alt" in node.attributes) ||
          !node.attributes.width ||
          !node.attributes.height)
      )
        errors.push(`${file}: image needs alt and dimensions`);
    }
    if (nodes.filter((node) => node.tagName === "h1").length !== 1)
      errors.push(`${file}: expected one h1`);
    documents.set(file, { nodes, ids });
  }
  function checkReference(file, reference) {
    if (!reference || /^(https?:|mailto:|tel:)/i.test(reference)) return;
    if (/^[a-z][a-z\d+.-]*:/i.test(reference) || reference.startsWith("//")) {
      errors.push(`${file}: unsupported URL ${reference}`);
      return;
    }
    let url;
    try {
      url = new URL(reference, `https://local.invalid/${file}`);
    } catch {
      errors.push(`${file}: invalid URL ${reference}`);
      return;
    }
    let name = decodeURIComponent(url.pathname).slice(1);
    if (!name || name.endsWith("/")) name += "index.html";
    const target = path.resolve(root, name);
    if (!isWithin(root, target) || !fs.existsSync(target)) {
      errors.push(`${file}: missing ${reference}`);
      return;
    }
    if (
      url.hash &&
      documents.has(name) &&
      !documents.get(name).ids.has(decodeURIComponent(url.hash.slice(1)))
    )
      errors.push(`${file}: missing anchor ${reference}`);
  }
  let references = 0;
  for (const [file, { nodes }] of documents) {
    for (const node of nodes) {
      for (const name of ["href", "src", "data-src"]) {
        if (name in node.attributes) {
          checkReference(file, node.attributes[name]);
          references++;
        }
      }
      if (node.attributes["data-sequence-base"]) {
        const count = Number(node.attributes["data-sequence-count"]);
        if (!Number.isInteger(count) || count < 1 || count > 1000)
          errors.push(`${file}: invalid frame count`);
        else
          for (let i = 1; i <= count; i++)
            checkReference(
              file,
              `${node.attributes["data-sequence-base"]}${i}.jpg`,
            );
      }
    }
  }
  for (const file of filesIn(root).filter((file) => file.endsWith(".css"))) {
    const css = fs.readFileSync(path.join(root, file), "utf8");
    for (const match of css.matchAll(/url\(["']?([^"')]+)["']?\)/g))
      checkReference(file, match[1]);
  }
  return { pages: htmlFiles.length, references, errors };
}

if (require.main === module) {
  const result = validateSite();
  if (result.errors.length) {
    console.error(result.errors.join("\n"));
    process.exitCode = 1;
  } else
    console.log(
      `Validated ${result.pages} pages and ${result.references} references, including all animation frames.`,
    );
}

module.exports = { validateSite };
