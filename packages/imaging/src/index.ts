import sharp, { Sharp } from "sharp";

export type Size = { width: number; height: number };
export type UploadedImage = { id: string; buffer: Buffer; filename: string; kind?: 'photo'|'logo'|'background' };
export type Palette = { dominant: string; accent: string };
export type GenerateOptions = { title?: string; sizes?: Size[]; };

export type ThumbnailResult = {
  base: Buffer;
  variants: { size: Size; buffer: Buffer }[];
};

const toHex = (r: number, g: number, b: number) =>
  '#' + [r,g,b].map(v => v.toString(16).padStart(2,'0')).join('');

function lighten(hex: string, amt = 0.18): string {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!m) return hex;
  const [r,g,b] = [m[1],m[2],m[3]].map(x=>parseInt(x,16));
  const f = (v:number)=>Math.min(255, Math.round(v + (255-v)*amt));
  return toHex(f(r), f(g), f(b));
}

export async function extractPalette(buf: Buffer): Promise<Palette> {
  const s = await sharp(buf).stats();
  const dom = toHex(s.dominant.r, s.dominant.g, s.dominant.b);
  return { dominant: dom, accent: lighten(dom, 0.3) };
}

function gradientSVG(size: Size, c1: string, c2: string): Buffer {
  const { width, height } = size;
  const svg = `
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${c1}"/>
        <stop offset="100%" stop-color="${c2}"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <rect x="0" y="0" width="100%" height="100%" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="8" rx="36" ry="36"/>
  </svg>`;
  return Buffer.from(svg);
}

function titlePlateSVG(w: number, h: number, title: string, subtitle?: string): Buffer {
  const margin = 28;
  const big = Math.round(h*0.28);
  const small = Math.round(h*0.16);
  const tspan = subtitle ? `<tspan x="${margin}" dy="${small+14}" font-size="${small}" fill="#e6e6e6">${subtitle}</tspan>` : "";
  const svg = `
  <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="rgba(0,0,0,0.7)"/>
      </filter>
    </defs>
    <g filter="url(#shadow)">
      <rect x="0" y="0" width="${w}" height="${h}" rx="28" ry="28" fill="rgba(0,0,0,0.76)"/>
      <text x="${margin}" y="${margin + big}" font-size="${big}" fill="#fff" font-family="sans-serif" font-weight="700">${title}</text>
      ${tspan}
    </g>
  </svg>`;
  return Buffer.from(svg);
}

function roundedMaskSVG(w:number, h:number, r:number): Buffer {
  const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="${w}" height="${h}" rx="${r}" ry="${r}" fill="#fff"/>
  </svg>`;
  return Buffer.from(svg);
}

async function resizeToFit(buf: Buffer, box: Size): Promise<Buffer> {
  const img = sharp(buf);
  const meta = await img.metadata();
  const ratio = Math.min(box.width / (meta.width||box.width), box.height / (meta.height||box.height));
  const width = Math.max(1, Math.floor((meta.width||box.width)*ratio));
  const height = Math.max(1, Math.floor((meta.height||box.height)*ratio));
  return await img.resize({ width, height, fit: "inside", withoutEnlargement: true }).toBuffer();
}

export async function generateThumbnail(images: UploadedImage[], opts: GenerateOptions = {}): Promise<ThumbnailResult> {
  if (!images.length) throw new Error("No images provided");
  const title = opts.title || "Sample Title — League";
  const canvas: Size = { width: 1280, height: 720 };
  // Heuristic: pick largest image as subject; next two as logos
  const sorted = [...images].sort((a,b)=> (b.buffer.length - a.buffer.length));
  const subject = sorted[0];
  const logos = sorted.slice(1,3);
  const pal = await extractPalette(subject.buffer);
  let base = sharp(gradientSVG(canvas, pal.dominant, pal.accent)).png();

  // Subject (left side)
  const targetH = Math.floor(canvas.height*0.86);
  let subjBuf = await sharp(subject.buffer).resize({ height: targetH }).toBuffer();
  const sMeta = await sharp(subjBuf).metadata();
  const mask = roundedMaskSVG(sMeta.width||targetH, sMeta.height||targetH, 28);
  subjBuf = await sharp(subjBuf).composite([{ input: mask, blend: "dest-in" }]).toBuffer();

  base = base.composite([
    // subject
    { input: subjBuf, left: Math.floor(canvas.width*0.05), top: Math.floor((canvas.height - (sMeta.height||targetH))/2) },
  ]);

  // Title plate (right)
  const plateW = Math.floor(canvas.width*0.52);
  const plateH = Math.floor(canvas.height*0.28);
  const parts = title.split("—");
  const titleTop = parts[0].trim();
  const sub = parts.slice(1).join("—").trim();
  const plate = titlePlateSVG(plateW, plateH, titleTop, sub || undefined);
  const px = Math.floor(canvas.width*0.43);
  const py = Math.floor(canvas.height*0.12);
  base = base.composite([{ input: plate, left: px, top: py }]);

  // Logo plates bottom-right
  let lx = Math.floor(canvas.width*0.60);
  const by = Math.floor(canvas.height*0.64);
  const gap = 24;
  for (const logo of logos) {
    const maxW = Math.floor(canvas.width*0.20);
    const maxH = Math.floor(canvas.height*0.14);
    const lbuf = await resizeToFit(logo.buffer, { width: maxW-32, height: maxH-32 });
    const meta = await sharp(lbuf).metadata();
    const plateSvg = `<svg width="${(meta.width||maxW)+32}" height="${(meta.height||maxH)+32}" xmlns="http://www.w3.org/2000/svg">
      <defs><filter id="sh"><feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="rgba(0,0,0,0.7)"/></filter></defs>
      <g filter="url(#sh)">
        <rect x="0" y="0" width="${(meta.width||maxW)+32}" height="${(meta.height||maxH)+32}" rx="22" ry="22" fill="rgba(255,255,255,0.94)"/>
      </g>
    </svg>`;
    const plateBuf = Buffer.from(plateSvg);
    base = base.composite([
      { input: plateBuf, left: lx, top: by },
      { input: lbuf, left: lx+16, top: by+16 }
    ]);
    lx += (meta.width||maxW)+32 + gap;
  }

  const baseBuf = await base.png().toBuffer();

  // Variants
  const sizes: Size[] = opts.sizes || [
    { width: 1080, height: 1080 },
    { width: 1080, height: 1920 }
  ];
  const variants = await Promise.all(sizes.map(async s => ({
    size: s,
    buffer: await sharp(baseBuf).resize({ width: s.width, height: s.height, fit: "cover", position: "attention" }).png().toBuffer()
  })));

  return { base: baseBuf, variants };
}
