# ThumbGen Monorepo (MVP)
Local-first thumbnail generator — web + API + CLI.

## Quickstart (npm workspaces)
```bash
# from repo root
npm i

# run API (http://localhost:8787)
npm run dev:api

# run Web UI (http://localhost:5173)
npm run dev:web
```

> The API is TypeScript + Express + Sharp; the frontend is React + Vite.
> Everything runs locally; images are never uploaded to third parties.

---

## Packages
- `packages/imaging` — core composition using **sharp** (+SVG overlays).
- `apps/api` — Express server with `/api/generate`.
- `apps/web` — React UI (drop images, title, “Polish”).
- `packages/cli` — simple CLI `thumbgen` to batch-generate.

### Notes
- Minimal MVP avoids ML models for masking; uses rounded-rect subject crop and palette-based gradient background.
- You can later add `onnxruntime-node` + U2Net for subject masks; hooks are stubbed in `packages/imaging`.
