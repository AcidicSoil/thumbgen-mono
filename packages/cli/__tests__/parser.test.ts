import { describe, it, expect } from 'vitest';
import { buildParser } from '../src/index';

describe('CLI parser', () => {
  it('parses options', async () => {
    const argv = await buildParser(['-i', 'src', '-t', 'Title', '-o', 'out', '--size', '640x360', '--size', '800x600']).parseAsync();
    expect(argv.input).toBe('src');
    expect(argv.title).toBe('Title');
    expect(argv.out).toBe('out');
    expect(argv.size).toEqual(['640x360', '800x600']);
  });

  it('uses defaults when options omitted', async () => {
    const argv = await buildParser([]).parseAsync();
    expect(argv.input).toBe('.');
    expect(argv.title).toBe('Sample — CLI');
  });

  it('includes options in help output', async () => {
    const help = await buildParser([]).getHelp();
    expect(help).toContain('--input');
    expect(help).toContain('--title');
    expect(help).toContain('--out');
    expect(help).toContain('--size');
  });
});
