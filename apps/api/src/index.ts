import express from "express";
import cors from "cors";
import multer from "multer";
import { z } from "zod";
import { generateThumbnail, UploadedImage } from "@thumbgen/imaging";

export const app = express();
const upload = multer({ limits: { fileSize: 25 * 1024 * 1024 } });
app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => res.json({ ok: true, name: "thumbgen-api" }));

const BodySchema = z.object({
  title: z.string().min(1)
});

const FilesSchema = z.array(z.any()).min(1).max(10);

app.post("/api/generate", upload.array("images", 10), async (req, res) => {
  const bodyResult = BodySchema.safeParse(req.body);
  const fileResult = FilesSchema.safeParse(req.files);

  if (!bodyResult.success || !fileResult.success) {
    return res.status(400).json({ ok: false, error: "invalid request" });
  }

  try {
    const title = bodyResult.data.title;
    const files = fileResult.data as Express.Multer.File[];
    const imgs: UploadedImage[] = files.map((f, i) => ({
      id: String(i),
      buffer: f.buffer,
      filename: f.originalname
    }));
    const result = await generateThumbnail(imgs, { title });
    const base64 = `data:image/png;base64,${result.base.toString("base64")}`;
    const variants = result.variants.map(v => ({
      size: v.size,
      dataUrl: `data:image/png;base64,${v.buffer.toString("base64")}`
    }));
    res.json({ ok: true, preview: base64, variants });
  } catch (e:unknown) {
    res.status(500).json({ ok:false, error: e?.message || "failed" });
  }
});

if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 8787;
  app.listen(PORT, () => console.log(`[thumbgen-api] http://localhost:${PORT}`));
}

export default app;
