"use client";
import { useState, useRef } from "react";
import Image from "next/image";

function formatCop(cents: number): string {
  return `$${cents.toLocaleString("es-CO")}`;
}

export function AdminEditClient({ product }: { product: any }) {
  const [msg, setMsg] = useState("");
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState(product.images ?? []);
  const fileRef = useRef<HTMLInputElement>(null);
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

  async function toggleActive() {
    const res = await fetch(`${base}/api/v1/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-role": "admin" },
      body: JSON.stringify({ isActive: !product.isActive }),
    });
    if (res.ok) {
      setMsg("✅ Actualizado");
    } else {
      setMsg("❌ Error al actualizar");
    }
  }

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setMsg("❌ Máximo 5MB"); return; }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { setMsg("❌ Solo JPEG, PNG, WebP"); return; }

    setUploading(true);
    setMsg("Subiendo...");
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch(`${base}/api/v1/products/${product.id}/images`, {
        method: "POST",
        headers: { "x-role": "admin" },
        body: fd,
      });
      if (res.ok) {
        const data = await res.json();
        setImages((prev: any[]) => [...prev, data]);
        setMsg("✅ Imagen subida");
      } else {
        setMsg(`❌ Error ${res.status}`);
      }
    } catch {
      setMsg("❌ Error de conexión");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <main style={{ padding: "1rem", maxWidth: 640, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 4 }}>{product.name}</h1>
      <p style={{ fontSize: 12, opacity: 0.5, marginBottom: 20 }}>
        Slug: {product.slug} · Orden: {product.sortOrder}
      </p>

      {/* Active toggle */}
      <div style={{ marginBottom: 20, padding: 12, background: "#f9fafb", borderRadius: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Estado del producto</div>
            <div style={{ fontSize: 12, opacity: 0.6 }}>{product.isActive ? "Activo y visible en la tienda" : "Oculto de la tienda"}</div>
          </div>
          <button
            onClick={toggleActive}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              background: product.isActive ? "#22c55e" : "#ef4444",
              color: "#fff",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            {product.isActive ? "✓ Activo" : "✗ Inactivo"}
          </button>
        </div>
      </div>

      {/* Variants */}
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ margin: "0 0 8px", fontSize: 14 }}>Variantes</h3>
        <div style={{ border: "1px solid #eee", borderRadius: 8, overflow: "hidden" }}>
          {product.variants?.map((v: any) => (
            <div key={v.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", borderBottom: "1px solid #f0f0f0", fontSize: 13 }}>
              <span>{v.name}</span>
              <span style={{ fontWeight: 700, color: "#e11d48" }}>{formatCop(v.priceCents)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Images */}
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ margin: "0 0 8px", fontSize: 14 }}>Imágenes del producto</h3>

        {images.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8, marginBottom: 12 }}>
            {images.map((img: any, i: number) => (
              <div key={i} style={{ position: "relative", aspectRatio: "1/1", borderRadius: 8, overflow: "hidden", background: "#f0f0f0" }}>
                <Image src={img.url} alt={product.name} fill style={{ objectFit: "cover" }} sizes="120px" />
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: 12, opacity: 0.5, marginBottom: 12 }}>Sin imágenes — subí una para que aparezca en la tienda</p>
        )}

        <div
          onClick={() => fileRef.current?.click()}
          style={{
            padding: "20px",
            border: "2px dashed #ddd",
            borderRadius: 8,
            textAlign: "center",
            cursor: "pointer",
            background: "#fafafa",
            opacity: uploading ? 0.5 : 1,
          }}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={upload}
            style={{ display: "none" }}
          />
          {uploading ? (
            <span style={{ fontSize: 13, color: "#64748b" }}>Subiendo...</span>
          ) : (
            <>
              <div style={{ fontSize: 24, marginBottom: 4 }}>📸</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Tocá para subir imagen</div>
              <div style={{ fontSize: 11, opacity: 0.5 }}>JPEG, PNG o WebP — Máximo 5MB</div>
            </>
          )}
        </div>
      </div>

      {msg && (
        <div style={{ padding: 10, background: msg.startsWith("✅") ? "#f0fdf4" : "#fef2f2", borderRadius: 8, fontSize: 13, color: msg.startsWith("✅") ? "#16a34a" : "#e11d48", marginBottom: 16 }}>
          {msg}
        </div>
      )}
    </main>
  );
}
