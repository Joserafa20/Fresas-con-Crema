"use client";
import { useState, useEffect, useMemo } from "react";

const TOPPING_UNIT_PRICE = 1500;

function formatCop(cents: number): string {
  return `$${cents.toLocaleString("es-CO")}`;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  images?: { url: string }[];
  variants: { id: string; name: string; priceCents: number }[];
  toppings: { id: string; name: string; topping?: { id: string; name: string } }[];
}

export interface CartItem {
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  priceAtOrder: number;
  quantity: number;
  toppings: { toppingId: string; toppingName: string; priceAtOrder: number }[];
}

interface ProductPickerProps {
  onAddItem: (item: CartItem) => void;
}

export function ProductPicker({ onAddItem }: ProductPickerProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
    fetch(`${base}/api/v1/products`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setProducts(data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const selectedProduct = products.find((p) => p.id === selectedProductId) ?? null;
  const selectedVariant = selectedProduct?.variants.find((v) => v.id === selectedVariantId) ?? selectedProduct?.variants[0] ?? null;

  const getToppingName = (t: any) => t.name ?? t.topping?.name ?? "";
  const getToppingId = (t: any) => t.id ?? t.topping?.id ?? "";

  const itemTotal = useMemo(() => {
    if (!selectedVariant) return 0;
    const base = selectedVariant.priceCents;
    const toppingsTotal = selectedToppings.length * TOPPING_UNIT_PRICE;
    return (base + toppingsTotal) * quantity;
  }, [selectedVariant, selectedToppings, quantity]);

  const handleAdd = () => {
    if (!selectedProduct || !selectedVariant) return;
    const item: CartItem = {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      variantId: selectedVariant.id,
      variantName: selectedVariant.name,
      priceAtOrder: selectedVariant.priceCents + selectedToppings.length * TOPPING_UNIT_PRICE,
      quantity,
      toppings: selectedToppings.map((tid) => {
        const t = selectedProduct.toppings.find((tp) => getToppingId(tp) === tid);
        return { toppingId: tid, toppingName: getToppingName(t ?? {}), priceAtOrder: TOPPING_UNIT_PRICE };
      }),
    };
    onAddItem(item);
    setSelectedProductId(null);
    setSelectedVariantId(null);
    setSelectedToppings([]);
    setQuantity(1);
  };

  if (loading) {
    return <div style={{ padding: 20, textAlign: "center", opacity: 0.6 }}>Cargando productos...</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 16, background: "#f9fafb", borderRadius: 12, border: "1px dashed #ddd" }}>
      <h3 style={{ margin: 0, fontSize: 14 }}>➕ Agregar otro producto</h3>

      {/* Product grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 6 }}>
        {products.map((p) => (
          <button
            key={p.id}
            onClick={() => { setSelectedProductId(p.id); setSelectedVariantId(p.variants[0]?.id ?? null); setSelectedToppings([]); setQuantity(1); }}
            style={{
              padding: "8px 6px",
              borderRadius: 8,
              border: selectedProductId === p.id ? "2px solid #e11d48" : "1px solid #ddd",
              background: selectedProductId === p.id ? "#ffe4e6" : "#fff",
              cursor: "pointer",
              fontSize: 12,
              textAlign: "center",
            }}
          >
            <strong style={{ fontSize: 11 }}>{p.name}</strong>
            {p.variants[0] && <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>{formatCop(p.variants[0].priceCents)}</div>}
          </button>
        ))}
      </div>

      {selectedProduct && (
        <>
          {/* Variant selection */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600 }}>Tamaño</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
              {selectedProduct.variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariantId(v.id)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 16,
                    border: selectedVariantId === v.id ? "2px solid #e11d48" : "1px solid #ddd",
                    background: selectedVariantId === v.id ? "#ffe4e6" : "#fff",
                    cursor: "pointer",
                    fontSize: 12,
                  }}
                >
                  {v.name} — {formatCop(v.priceCents)}
                </button>
              ))}
            </div>
          </div>

          {/* Toppings */}
          {selectedProduct.toppings.length > 0 && (
            <div>
              <label style={{ fontSize: 12, fontWeight: 600 }}>Toppings (+{formatCop(TOPPING_UNIT_PRICE)} c/u)</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                {selectedProduct.toppings.map((t) => {
                  const tid = getToppingId(t);
                  const tname = getToppingName(t);
                  const checked = selectedToppings.includes(tid);
                  return (
                    <label key={tid} style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer", fontSize: 12 }}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => setSelectedToppings((s) => (s.includes(tid) ? s.filter((x) => x !== tid) : [...s, tid]))}
                      />
                      {tname}
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity + Add */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600 }}>Cant.</span>
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                style={{ width: 30, height: 30, borderRadius: 15, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 16 }}
              >
                −
              </button>
              <span style={{ fontWeight: 700, minWidth: 24, textAlign: "center" }}>{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                style={{ width: 30, height: 30, borderRadius: 15, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 16 }}
              >
                +
              </button>
            </div>
            <button
              onClick={handleAdd}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "none",
                background: "#e11d48",
                color: "#fff",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Agregar — {formatCop(itemTotal)}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
