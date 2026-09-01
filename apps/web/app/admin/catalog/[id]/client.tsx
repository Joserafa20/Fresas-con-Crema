"use client";
import { useState } from "react";

function formatCop(cents: number): string {
  return `$${cents.toLocaleString("es-CO")}`;
}

export function AdminEditClient({ product }: { product: any }) {
  const [msg, setMsg] = useState("");
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

  async function toggleActive() {
    const res = await fetch(`${base}/api/v1/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-role": "admin" },
      body: JSON.stringify({ isActive: !product.isActive }),
    });
    setMsg(res.ok ? "Actualizado" : "Error");
  }

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setMsg("File too large"); return; }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { setMsg("Unsupported media type"); return; }
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`${base}/api/v1/products/${product.id}/images`, {
      method: "POST",
      headers: { "x-role": "admin" },
      body: fd,
    });
    setMsg(res.ok ? "Imagen subida" : `Error ${res.status}`);
  }

  return (
    <main style={{ padding: "1rem", maxWidth: 640, margin: "0 auto" }}>
      <h1>Editar — {product.name}</h1>
      <p>Slug: {product.slug} · Orden: {product.sortOrder} · Activo: {String(product.isActive)}</p>
      <button onClick={toggleActive} style={{ padding: "8px 12px", cursor: "pointer" }}>Toggle isActive</button>
      <div style={{ marginTop: 16 }}>
        <h3>Variantes</h3>
        <ul>{product.variants?.map((v: any) => <li key={v.id}>{v.name} — {formatCop(v.priceCents)}</li>)}</ul>
      </div>
      <div style={{ marginTop: 16 }}>
        <h3>Subir imagen (jpeg/png/webp ≤5MB)</h3>
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} />
      </div>
      {msg && <p style={{ marginTop: 12, color: "#e11d48" }}>{msg}</p>}
      <div style={{ marginTop: 16 }}>
        <h3>Historial de precios</h3>
        <p style={{ fontSize: 12, opacity: 0.6 }}>Ver en GET /api/v1/variants/:id/price-history</p>
      </div>
    </main>
  );
}
