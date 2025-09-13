import { describe, it, expect } from 'vitest';
import { mkdtemp, writeFile, readdir, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { main } from '../src/index';

const redPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/P1XtvwAAAABJRU5ErkJggg==', 'base64');

describe('CLI integration', () => {
  it('writes thumbnails to output directory', async () => {
    const base = await mkdtemp(join(tmpdir(), 'thumb-cli-'));
    const inputDir = join(base, 'in');
    const outDir = join(base, 'out');
    await mkdir(inputDir);
    await mkdir(outDir);
    await writeFile(join(inputDir, 'img.png'), redPng);
    const prev = process.argv;
    process.argv = ['node', 'thumbgen', '--input', inputDir, '--out', outDir, '--title', 'CLI Test'];
    try {
      await main();
    } finally {
      process.argv = prev;
    }
    const files = await readdir(outDir);
    expect(files).toContain('thumb_1280x720.png');
    expect(files).toContain('thumb_1080x1080.png');
    expect(files).toContain('thumb_1080x1920.png');
  });
});
