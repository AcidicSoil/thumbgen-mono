import React, { useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";

const API_URL = (import.meta.env.VITE_API_URL as string) || "http://localhost:8787";

export default function App() {
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("OPTX vs FAZE — HALO PRO LEAGUE");
  const [preview, setPreview] = useState<string | null>(null);
  const [variants, setVariants] = useState<{size:{width:number;height:number};dataUrl:string}[]>([]);
  const [loading, setLoading] = useState(false);

  const onDrop = (accepted: File[]) => setFiles(prev => [...prev, ...accepted].slice(0,10));
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { "image/*": [] } });

  const thumbs = useMemo(() => files.map(f => Object.assign(URL.createObjectURL(f), { name: f.name })), [files]);

  async function generate() {
    if (files.length === 0) return;
    setLoading(true);
    const fd = new FormData();
    files.forEach(f => fd.append("images", f));
    fd.append("title", title);
    const res = await fetch(`${API_URL}/api/generate`, { method: "POST", body: fd });
    const json = await res.json();
    if (json.ok) {
      setPreview(json.preview);
      setVariants(json.variants);
    } else {
      alert(json.error || "Generation failed");
    }
    setLoading(false);
  }

  return (
    <div style={{ fontFamily: "ui-sans-serif, system-ui, -apple-system", padding: 16, maxWidth: 1100, margin: "0 auto" }}>
      <h1>ThumbGen (MVP)</h1>
      <p>Drop a photo + 1–2 logos, enter a title, click <b>Polish</b>. Everything runs locally.</p>
      <div {...getRootProps()} style={{ border: "2px dashed #888", borderRadius: 12, padding: 20, background: isDragActive ? "#fafafa" : "#fff" }}>
        <input {...getInputProps()} />
        <p>Drag 'n' drop images here, or click to select (max 10)</p>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
        {thumbs.map((u, i) => (
          <div key={i} style={{ width: 120, height: 90, borderRadius: 8, overflow: "hidden", border: "1px solid #ddd" }}>
            <img src={u} alt={String(i)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12 }}>
        <label>Title:&nbsp;</label>
        <input value={title} onChange={e=>setTitle(e.target.value)} style={{ width: "100%", padding: 10, fontSize: 16, borderRadius: 8, border: "1px solid #ccc" }} />
      </div>
      <button disabled={loading || files.length===0} onClick={generate} style={{ marginTop: 12, padding: "10px 16px", borderRadius: 10, border: "1px solid #333" }}>
        {loading ? "Generating…" : "Polish"}
      </button>

      {preview && (
        <div style={{ marginTop: 16, display: "grid", gap: 16, gridTemplateColumns: "1fr 1fr 1fr" }}>
          <div>
            <h3>1280×720</h3>
            <img src={preview} style={{ width: "100%", borderRadius: 12, border: "1px solid #ddd" }} />
          </div>
          {variants.map((v, i)=> (
            <div key={i}>
              <h3>{v.size.width}×{v.size.height}</h3>
              <img src={v.dataUrl} style={{ width: "100%", borderRadius: 12, border: "1px solid #ddd" }} />
            </div>
          ))}
        </div>
      )}
      <footer style={{ marginTop: 24, opacity: 0.7 }}>MVP — no uploads leave your machine.</footer>
    </div>
  );
}
