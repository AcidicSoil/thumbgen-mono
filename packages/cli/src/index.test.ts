import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { buildParser } from './index.js';

test('parses CLI options', async () => {
  const argv = await buildParser(['-i', 'src', '-t', 'Title', '-o', 'out', '--size', '640x360', '--size', '800x600']).parseAsync();
  assert.equal(argv.input, 'src');
  assert.equal(argv.title, 'Title');
  assert.equal(argv.out, 'out');
  assert.deepEqual(argv.size, ['640x360', '800x600']);
});

test('uses defaults when options omitted', async () => {
  const argv = await buildParser([]).parseAsync();
  assert.equal(argv.input, '.');
  assert.equal(argv.title, 'Sample — CLI');
});

test('includes options in help output', async () => {
  const help = await buildParser([]).getHelp();
  assert.match(help, /--input/);
  assert.match(help, /--title/);
  assert.match(help, /--out/);
  assert.match(help, /--size/);
});
