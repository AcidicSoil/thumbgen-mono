import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8787";
export default function App() {
    const [files, setFiles] = useState([]);
    const [title, setTitle] = useState("OPTX vs FAZE — HALO PRO LEAGUE");
    const [preview, setPreview] = useState(null);
    const [variants, setVariants] = useState([]);
    const [loading, setLoading] = useState(false);
    const onDrop = (accepted) => setFiles(prev => [...prev, ...accepted].slice(0, 10));
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { "image/*": [] } });
    const thumbs = useMemo(() => files.map(f => Object.assign(URL.createObjectURL(f), { name: f.name })), [files]);
    async function generate() {
        if (files.length === 0)
            return;
        setLoading(true);
        const fd = new FormData();
        files.forEach(f => fd.append("images", f));
        fd.append("title", title);
        const res = await fetch(`${API_URL}/api/generate`, { method: "POST", body: fd });
        const json = await res.json();
        if (json.ok) {
            setPreview(json.preview);
            setVariants(json.variants);
        }
        else {
            alert(json.error || "Generation failed");
        }
        setLoading(false);
    }
    return (_jsxs("div", { style: { fontFamily: "ui-sans-serif, system-ui, -apple-system", padding: 16, maxWidth: 1100, margin: "0 auto" }, children: [_jsx("h1", { children: "ThumbGen (MVP)" }), _jsxs("p", { children: ["Drop a photo + 1\u20132 logos, enter a title, click ", _jsx("b", { children: "Polish" }), ". Everything runs locally."] }), _jsxs("div", { ...getRootProps(), style: { border: "2px dashed #888", borderRadius: 12, padding: 20, background: isDragActive ? "#fafafa" : "#fff" }, children: [_jsx("input", { ...getInputProps() }), _jsx("p", { children: "Drag 'n' drop images here, or click to select (max 10)" })] }), _jsx("div", { style: { display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }, children: thumbs.map((u, i) => (_jsx("div", { style: { width: 120, height: 90, borderRadius: 8, overflow: "hidden", border: "1px solid #ddd" }, children: _jsx("img", { src: u, alt: String(i), style: { width: "100%", height: "100%", objectFit: "cover" } }) }, i))) }), _jsxs("div", { style: { marginTop: 12 }, children: [_jsx("label", { children: "Title:\u00A0" }), _jsx("input", { value: title, onChange: e => setTitle(e.target.value), style: { width: "100%", padding: 10, fontSize: 16, borderRadius: 8, border: "1px solid #ccc" } })] }), _jsx("button", { disabled: loading || files.length === 0, onClick: generate, style: { marginTop: 12, padding: "10px 16px", borderRadius: 10, border: "1px solid #333" }, children: loading ? "Generating…" : "Polish" }), preview && (_jsxs("div", { style: { marginTop: 16, display: "grid", gap: 16, gridTemplateColumns: "1fr 1fr 1fr" }, children: [_jsxs("div", { children: [_jsx("h3", { children: "1280\u00D7720" }), _jsx("img", { src: preview, style: { width: "100%", borderRadius: 12, border: "1px solid #ddd" } })] }), variants.map((v, i) => (_jsxs("div", { children: [_jsxs("h3", { children: [v.size.width, "\u00D7", v.size.height] }), _jsx("img", { src: v.dataUrl, style: { width: "100%", borderRadius: 12, border: "1px solid #ddd" } })] }, i)))] })), _jsx("footer", { style: { marginTop: 24, opacity: 0.7 }, children: "MVP \u2014 no uploads leave your machine." })] }));
}
