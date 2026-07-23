import { createHash } from "node:crypto";
import { access, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDirectory = path.join(root, "public");
const assetsDirectory = path.join(publicDirectory, "assets");
const documentPaths = [
  path.join(publicDirectory, "index.html"),
  path.join(publicDirectory, "404.html"),
  path.join(publicDirectory, "site.webmanifest")
];
const assetPattern = /\/assets\/([A-Za-z0-9][A-Za-z0-9._-]*)/g;
const exists = async (filePath) => access(filePath).then(() => true).catch(() => false);
const referencedAssets = new Set();
const documents = await Promise.all(documentPaths.map(async (filePath) => ({ filePath, content: await readFile(filePath, "utf8") })));

for (const { content } of documents) {
  for (const match of content.matchAll(assetPattern)) {
    referencedAssets.add(match[1]);
  }
}

const replacements = new Map();
const manifest = {};

for (const assetName of referencedAssets) {
  const sourcePath = path.join(assetsDirectory, assetName);
  if (!await exists(sourcePath)) {
    continue;
  }

  const extension = path.extname(assetName);
  const filename = path.basename(assetName, extension).replace(/\.[a-f0-9]{10}$/i, "");
  const hash = createHash("sha256").update(await readFile(sourcePath)).digest("hex").slice(0, 10);
  const fingerprintedName = `${filename}.${hash}${extension}`;
  const fingerprintedPath = path.join(assetsDirectory, fingerprintedName);

  if (assetName !== fingerprintedName) {
    if (await exists(fingerprintedPath)) {
      await rm(sourcePath);
    } else {
      await rename(sourcePath, fingerprintedPath);
    }
  }

  replacements.set(`/assets/${assetName}`, `/assets/${fingerprintedName}`);
  manifest[assetName.replace(/\.[a-f0-9]{10}(?=\.[^.]+$)/i, "")] = `/assets/${fingerprintedName}`;
}

for (const { filePath, content } of documents) {
  const updated = content.replace(assetPattern, (match) => replacements.get(match) || match);
  if (updated !== content) {
    await writeFile(filePath, updated);
  }
}

await writeFile(path.join(assetsDirectory, "asset-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Fingerprinted ${replacements.size} referenced assets and wrote the asset manifest.`);
