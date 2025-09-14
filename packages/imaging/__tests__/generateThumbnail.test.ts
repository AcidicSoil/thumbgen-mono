import { describe, it, expect } from 'vitest';
import sharp from 'sharp';
import { extractPalette, generateThumbnail, UploadedImage } from '../src/index';

// helper to create solid color image buffer
async function colorImage(r: number, g: number, b: number, size = 100) {
  return await sharp({ create: { width: size, height: size, channels: 3, background: { r, g, b } } }).png().toBuffer();
}

function lighten(hex: string, amt = 0.3): string {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex)!;
  const [r, g, b] = [m[1], m[2], m[3]].map((x) => parseInt(x, 16));
  const f = (v: number) => Math.min(255, Math.round(v + (255 - v) * amt));
  const toHex = (r: number, g: number, b: number) =>
    '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
  return toHex(f(r), f(g), f(b));
}

describe('imaging', () => {
  it('extracts dominant and accent colors', async () => {
    const buf = await colorImage(255, 0, 0);
    const pal = await extractPalette(buf);
    expect(pal.accent).toBe(lighten(pal.dominant, 0.3));
  });

  it('produces variants with requested sizes', async () => {
    const subject: UploadedImage = { id: 's', filename: 's.png', buffer: await colorImage(10, 20, 30, 200) };
    const logo1: UploadedImage = { id: 'l1', filename: 'l1.png', buffer: await colorImage(40, 50, 60, 50) };
    const logo2: UploadedImage = { id: 'l2', filename: 'l2.png', buffer: await colorImage(70, 80, 90, 40) };
    const res = await generateThumbnail([subject, logo1, logo2]);
    expect(res.variants).toHaveLength(2);
    const sizes = res.variants.map((v) => v.size);
    expect(sizes).toContainEqual({ width: 1080, height: 1080 });
    expect(sizes).toContainEqual({ width: 1080, height: 1920 });
  });

  it('fills variant backgrounds with gradient colors', async () => {
    const subject: UploadedImage = { id: 's', filename: 's.png', buffer: await colorImage(200, 100, 50, 300) };
    const logo: UploadedImage = { id: 'l', filename: 'l.png', buffer: await colorImage(10, 20, 30, 40) };
    const pal = await extractPalette(subject.buffer);
    const res = await generateThumbnail([subject, logo]);
    const variant = res.variants.find((v) => v.size.width === 1080 && v.size.height === 1080)!;
    const pixel = await sharp(variant.buffer)
      .extract({ left: 0, top: 0, width: 1, height: 1 })
      .raw()
      .toBuffer();
    const [r, g, b] = [pal.dominant.slice(1, 3), pal.dominant.slice(3, 5), pal.dominant.slice(5, 7)].map((h) => parseInt(h, 16));
    expect(Math.abs(pixel[0] - r)).toBeLessThan(5);
    expect(Math.abs(pixel[1] - g)).toBeLessThan(5);
    expect(Math.abs(pixel[2] - b)).toBeLessThan(5);
  });
});
