import request from "supertest";
import { describe, it, expect, vi } from "vitest";
import app from "./index";

vi.mock("@thumbgen/imaging", () => ({
  generateThumbnail: vi.fn().mockResolvedValue({ base: Buffer.from("img"), variants: [] })
}), { virtual: true });

describe("POST /api/generate", () => {
  it("accepts valid payload", async () => {
    const res = await request(app)
      .post("/api/generate")
      .field("title", "Sample")
      .attach("images", Buffer.from("img"), "test.png");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it("rejects invalid payload", async () => {
    const res = await request(app)
      .post("/api/generate")
      .field("title", "Sample");
    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
  });
});
