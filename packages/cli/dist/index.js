#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
export function buildParser(args = hideBin(process.argv)) {
    return yargs(args)
        .scriptName("thumbgen")
        .usage("$0 [options]")
        .option("input", {
        alias: "i",
        type: "string",
        describe: "Source directory",
        default: ".",
    })
        .option("title", {
        alias: "t",
        type: "string",
        describe: "Thumbnail title",
        default: "Sample — CLI",
    })
        .option("out", {
        alias: "o",
        type: "string",
        describe: "Output directory (defaults to input)",
    })
        .option("size", {
        type: "string",
        array: true,
        describe: "Additional variant size WIDTHxHEIGHT (repeatable)",
    })
        .help()
        .exitProcess(false);
}
function parseSize(v) {
    const m = /^(\d+)x(\d+)$/.exec(v);
    return m ? { width: Number(m[1]), height: Number(m[2]) } : undefined;
}
export async function main() {
    const argv = await buildParser().parseAsync();
    if (argv.help)
        return;
    const inDir = argv.input;
    const title = argv.title;
    const outDir = argv.out || inDir;
    const extraSizes = (argv.size || [])
        .map(parseSize)
        .filter((s) => !!s);
    const defaultSizes = [
        { width: 1080, height: 1080 },
        { width: 1080, height: 1920 },
    ];
    const sizes = defaultSizes.concat(extraSizes);
    const fs = await import("node:fs/promises");
    const entries = await fs.readdir(inDir, { withFileTypes: true });
    const imgs = [];
    for (const e of entries) {
        if (!e.isFile())
            continue;
        if (!/\.(png|jpg|jpeg|webp)$/i.test(e.name))
            continue;
        const buf = await readFile(resolve(inDir, e.name));
        imgs.push({ id: e.name, buffer: buf, filename: e.name });
    }
    if (imgs.length === 0)
        throw new Error("No images found in " + inDir);
    const { generateThumbnail } = await import("@thumbgen/imaging");
    const res = await generateThumbnail(imgs, { title, sizes });
    await writeFile(resolve(outDir, "thumb_1280x720.png"), res.base);
    for (const v of res.variants) {
        await writeFile(resolve(outDir, `thumb_${v.size.width}x${v.size.height}.png`), v.buffer);
    }
    console.log("Saved thumbnails to", outDir);
}
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    main().catch(err => {
        console.error(err);
        process.exit(1);
    });
}
