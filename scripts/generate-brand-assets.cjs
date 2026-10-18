// Optional artwork tooling. The published site needs no build step.
// Requires sharp, playwright, and Chromium (or CHROMIUM_PATH).
const fs = require("node:fs/promises");
const path = require("node:path");
const http = require("node:http");
const sharp = require("sharp");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");

async function main() {
  const source = await fs.readFile(path.join(root, "assets/icon.svg"), "utf8");
  for (const [file, size] of [
    ["apple-touch-icon.png", 180],
    ["assets/icon-192.png", 192],
    ["assets/icon-512.png", 512]
  ]) {
    await sharp(Buffer.from(source)).resize(size, size).removeAlpha().png().toFile(path.join(root, file));
  }

  const favicon = source.replace(/(<svg[^>]*>)/, '$1<defs><clipPath id="tile"><rect width="512" height="512" rx="112" /></clipPath></defs><g clip-path="url(#tile)">')
    .replace("</svg>", "</g></svg>");
  await fs.writeFile(path.join(root, "assets/favicon.svg"), favicon);

  // ICO directory containing PNG entries, supported by current browsers.
  const sizes = [16, 32, 48];
  const directory = Buffer.alloc(6 + 16 * sizes.length);
  directory.writeUInt16LE(1, 2);
  directory.writeUInt16LE(sizes.length, 4);
  const images = [];
  let offset = directory.length;
  for (const [i, size] of sizes.entries()) {
    const png = await sharp(Buffer.from(favicon)).resize(size, size).png().toBuffer();
    const entry = 6 + i * 16;
    directory[entry] = size;
    directory[entry + 1] = size;
    directory.writeUInt16LE(1, entry + 4);
    directory.writeUInt16LE(32, entry + 6);
    directory.writeUInt32LE(png.length, entry + 8);
    directory.writeUInt32LE(offset, entry + 12);
    images.push(png);
    offset += png.length;
  }
  await fs.writeFile(path.join(root, "favicon.ico"), Buffer.concat([directory, ...images]));

  const systemChromium = require("node:fs").existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined;
  const types = { ".html": "text/html", ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp" };
  const server = http.createServer(async (request, response) => {
    const file = path.resolve(root, "." + new URL(request.url, "http://localhost").pathname);
    if (!file.startsWith(root + path.sep)) { response.writeHead(403).end(); return; }
    try {
      const content = await fs.readFile(file);
      response.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream" });
      response.end(content);
    } catch { response.writeHead(404).end(); }
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  let browser;
  try {
    browser = await chromium.launch({
      executablePath: process.env.CHROMIUM_PATH || systemChromium,
      args: ["--no-sandbox"]
    });
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
    await page.goto(`http://127.0.0.1:${server.address().port}/assets/share-card.html`);
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(Array.from(document.images, img => img.decode()));
    });
    const png = await page.screenshot();
    await sharp(png).removeAlpha().png().toFile(path.join(root, "assets/og.png"));
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
  console.log("Generated Home Screen icons, favicons, and the 1200×630 share card.");
}

main().catch(error => { console.error(error); process.exitCode = 1; });
