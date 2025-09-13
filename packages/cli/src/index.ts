#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { generateThumbnail, UploadedImage } from "@thumbgen/imaging";

async function main() {
  const inDir = process.argv[2] || ".";
  const title = process.argv.slice(3).join(" ") || "Sample — CLI";
  const fs = await import("node:fs/promises");
  const entries = await fs.readdir(inDir, { withFileTypes: true });
  const imgs: UploadedImage[] = [];
  for (const e of entries) {
    if (!e.isFile()) continue;
    if (!/\.(png|jpg|jpeg|webp)$/i.test(e.name)) continue;
    const buf = await readFile(resolve(inDir, e.name));
    imgs.push({ id: e.name, buffer: buf, filename: e.name });
  }
  if (imgs.length === 0) throw new Error("No images found in " + inDir);
  const res = await generateThumbnail(imgs, { title });
  await writeFile(resolve(inDir, "thumb_1280x720.png"), res.base);
  for (const v of res.variants) {
    await writeFile(resolve(inDir, `thumb_${v.size.width}x${v.size.height}.png`), v.buffer);
  }
  console.log("Saved thumbnails to", inDir);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
