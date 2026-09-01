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
  toppings: { id: string; name: string }[];
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
  initialVariantId?: string | null;
  initialToppings?: string | null;
}

export function ProductPicker({ onAddItem, initialVariantId, initialToppings }: ProductPickerProps) {
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
      .then((data) => {
        setProducts(data);
        // Preselect from URL params
        if (initialVariantId) {
          for (const p of data) {
            const v = p.variants?.find((v: any) => v.id === initialVariantId);
            if (v) {
              setSelectedProductId(p.id);
              setSelectedVariantId(v.id);
              if (initialToppings) {
                setSelectedToppings(initialToppings.split(",").filter(Boolean));
              }
              break;
            }
          }
        }
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [initialVariantId, initialToppings]);

  const selectedProduct = products.find((p) => p.id === selectedProductId) ?? null;
  const selectedVariant = selectedProduct?.variants.find((v) => v.id === selectedVariantId) ?? selectedProduct?.variants[0] ?? null;

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
        const t = selectedProduct.toppings.find((tp) => tp.id === tid);
        return { toppingId: tid, toppingName: t?.name ?? "", priceAtOrder: TOPPING_UNIT_PRICE };
      }),
    };
    onAddItem(item);
    setQuantity(1);
    setSelectedToppings([]);
  };

  if (loading) {
    return <div style={{ padding: 20, textAlign: "center", opacity: 0.6 }}>Cargando productos...</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h3 style={{ margin: 0 }}>Selecciona tu producto</h3>

      {/* Product grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }}>
        {products.map((p) => (
          <button
            key={p.id}
            onClick={() => { setSelectedProductId(p.id); setSelectedVariantId(p.variants[0]?.id ?? null); setSelectedToppings([]); }}
            style={{
              padding: "10px 8px",
              borderRadius: 8,
              border: selectedProductId === p.id ? "2px solid #e11d48" : "1px solid #ddd",
              background: selectedProductId === p.id ? "#ffe4e6" : "#fff",
              cursor: "pointer",
              fontSize: 13,
              textAlign: "left",
            }}
          >
            <strong>{p.name}</strong>
            {p.variants[0] && <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>{formatCop(p.variants[0].priceCents)}</div>}
          </button>
        ))}
      </div>

      {selectedProduct && (
        <>
          {/* Variant selection */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600 }}>Tamaño</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
              {selectedProduct.variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariantId(v.id)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 20,
                    border: selectedVariantId === v.id ? "2px solid #e11d48" : "1px solid #ddd",
                    background: selectedVariantId === v.id ? "#ffe4e6" : "#fff",
                    cursor: "pointer",
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
              <label style={{ fontSize: 13, fontWeight: 600 }}>Toppings (+{formatCop(TOPPING_UNIT_PRICE)} c/u)</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
                {selectedProduct.toppings.map((t) => {
                  const checked = selectedToppings.includes(t.id);
                  return (
                    <label key={t.id} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14 }}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => setSelectedToppings((s) => (s.includes(t.id) ? s.filter((x) => x !== t.id) : [...s, t.id]))}
                      />
                      {t.name}
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <label style={{ fontSize: 13, fontWeight: 600 }}>Cantidad</label>
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              style={{ width: 32, height: 32, borderRadius: 16, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 16 }}
            >
              −
            </button>
            <span style={{ fontWeight: 600, minWidth: 24, textAlign: "center" }}>{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              style={{ width: 32, height: 32, borderRadius: 16, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 16 }}
            >
              +
            </button>
          </div>

          {/* Item total */}
          <div style={{ padding: 10, background: "#fff1f2", borderRadius: 8, fontSize: 14 }}>
            Subtotal: <strong>{formatCop(itemTotal)}</strong>
          </div>

          {/* Add button */}
          <button
            onClick={handleAdd}
            style={{
              padding: "12px 20px",
              borderRadius: 8,
              border: "none",
              background: "#e11d48",
              color: "#fff",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Agregar al pedido
          </button>
        </>
      )}
    </div>
  );
}
