import express from "express";
import cors from "cors";
import multer from "multer";
import { generateThumbnail, UploadedImage } from "@thumbgen/imaging";

const app = express();
const upload = multer({ limits: { fileSize: 25 * 1024 * 1024 } });
app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => res.json({ ok: true, name: "thumbgen-api" }));

app.post("/api/generate", upload.array("images", 10), async (req, res) => {
  try {
    const title = (req.body.title as string) || "OPTX vs FAZE — HALO PRO LEAGUE";
    const files = (req.files as Express.Multer.File[]) || [];
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
  } catch (e:any) {
    res.status(500).json({ ok:false, error: e?.message || "failed" });
  }
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => console.log(`[thumbgen-api] http://localhost:${PORT}`));
