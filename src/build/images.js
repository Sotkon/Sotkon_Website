const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

async function prepareImages(source, target) {
  const images = new Map();
  async function visit(directory, relative = "") {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const name = path.posix.join(relative, entry.name);
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await visit(file, name);
        continue;
      }
      if (!/\.(png|jpe?g|svg)$/i.test(name)) continue;
      const metadata = await sharp(file).metadata();
      const info = {
        width: metadata.width,
        height: metadata.height,
        optimized: null,
      };
      if (
        !name.includes("-sequence/") &&
        /\.(png|jpe?g)$/i.test(name) &&
        fs.statSync(file).size > 100_000
      ) {
        const buffer = await sharp(file).webp({ quality: 82 }).toBuffer();
        if (buffer.length < fs.statSync(file).size * 0.9) {
          info.optimized = name.replace(/\.[^.]+$/, ".webp");
          fs.writeFileSync(path.join(target, info.optimized), buffer);
        }
      }
      images.set(name, info);
    }
  }
  await visit(source);
  return images;
}

function enhanceImages(html, images) {
  let imageNumber = 0;
  return html.replace(/<img\b[^>]*>/g, (tag) => {
    imageNumber += 1;
    const source = tag.match(/\bsrc="([^"]*)"/)?.[1];
    const name = source?.split("assets/")[1];
    const image = images.get(name);
    if (!image) throw new Error(`Unknown image: ${source}`);
    if (image.optimized)
      tag = tag.replace(source, source.replace(name, image.optimized));
    if (!/\bwidth=/.test(tag))
      tag = tag.replace(
        /\s*\/?>$/,
        ` width="${image.width}" height="${image.height}">`,
      );
    if (!/\bdecoding=/.test(tag)) tag = tag.replace(/>$/, ' decoding="async">');
    // Logo and hero load immediately; below-the-fold images load on demand.
    if (imageNumber > 2 && !/\bloading=/.test(tag))
      tag = tag.replace(/>$/, ' loading="lazy">');
    return tag;
  });
}

module.exports = { prepareImages, enhanceImages };
