import request from 'supertest';
import { describe, it, expect } from 'vitest';
import app from '../src/index';

const redPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/P1XtvwAAAABJRU5ErkJggg==', 'base64');

describe('POST /api/generate', () => {
  it('creates thumbnails from uploaded image', async () => {
    const res = await request(app)
      .post('/api/generate')
      .field('title', 'From API')
      .attach('images', redPng, 'test.png');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.variants).toHaveLength(2);
  });
});
