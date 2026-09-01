"use client";
import { useState, useMemo } from "react";
import Image from "next/image";
import { VariantPicker } from "../../../components/catalog/VariantPicker";
import { ToppingSelector } from "../../../components/catalog/ToppingSelector";

const TOPPING_UNIT_PRICE = 1500;

function calcTotalCents(baseCents: number, toppingCount: number): number {
  return baseCents + TOPPING_UNIT_PRICE * toppingCount;
}

function formatCop(cents: number): string {
  return `$${cents.toLocaleString("es-CO")}`;
}

export function CatalogDetailClient({ product }: { product: any }) {
  const variants = product.variants ?? [];
  const [variantId, setVariantId] = useState(variants[0]?.id ?? "");
  const [selected, setSelected] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const variant = variants.find((v: any) => v.id === variantId) ?? variants[0];
  const base = variant?.priceCents ?? 0;
  const total = useMemo(() => calcTotalCents(base, selected.length) * quantity, [base, selected.length, quantity]);
  const unitTotal = useMemo(() => calcTotalCents(base, selected.length), [base, selected.length]);
  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const toppings = product.toppings ?? [];

  return (
    <main style={{ padding: "1rem", maxWidth: 640, margin: "0 auto" }}>
      <h1>{product.name}</h1>
      {product.images?.[0] && (
        <div style={{ position: "relative", width: "100%", aspectRatio: "1/1", background: "#fafafa", borderRadius: 12, overflow: "hidden" }}>
          <Image src={product.images[0].url} alt={product.name} fill style={{ objectFit: "cover" }} sizes="100vw" />
        </div>
      )}
      <p>{product.description}</p>
      <h3>Variantes</h3>
      <VariantPicker variants={variants} value={variantId} onChange={setVariantId} />
      <h3>Toppings (+{formatCop(TOPPING_UNIT_PRICE)} c/u)</h3>
      <ToppingSelector toppings={toppings} selected={selected} onToggle={toggle} />

      {/* Quantity */}
      <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 600 }}>Cantidad</span>
        <button
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          style={{ width: 36, height: 36, borderRadius: 18, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          −
        </button>
        <span style={{ fontWeight: 700, minWidth: 30, textAlign: "center", fontSize: 18 }}>{quantity}</span>
        <button
          onClick={() => setQuantity((q) => q + 1)}
          style={{ width: 36, height: 36, borderRadius: 18, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          +
        </button>
      </div>

      <div style={{ marginTop: 16, padding: 12, background: "#fff1f2", borderRadius: 8, fontWeight: 700 }}>
        Total: {formatCop(total)}
        <span style={{ fontWeight: 400, marginLeft: 8, fontSize: 12, opacity: 0.7 }}>
          {formatCop(unitTotal)} × {quantity}
        </span>
      </div>
      <a
        href={`/checkout?productId=${product.id}&variant=${variantId}&toppings=${selected.join(",")}&qty=${quantity}`}
        style={{
          display: "block",
          marginTop: 16,
          padding: "14px 0",
          background: "#e11d48",
          color: "#fff",
          textAlign: "center",
          borderRadius: 8,
          fontWeight: 700,
          fontSize: 16,
          textDecoration: "none",
        }}
      >
        Hacer Pedido — {formatCop(total)}
      </a>
    </main>
  );
}
