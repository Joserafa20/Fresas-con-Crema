"use client";
import { formatCop } from "@maison-fraise/shared";
import type { CartItem } from "./ProductPicker";
import type { CustomerData } from "./CustomerForm";
import type { PaymentMethod } from "@maison-fraise/shared";

interface OrderSummaryProps {
  items: CartItem[];
  customer: CustomerData;
  paymentMethod: PaymentMethod;
  onRemoveItem: (index: number) => void;
  onSubmit: () => void;
  submitting: boolean;
}

export function OrderSummary({ items, customer, paymentMethod, onRemoveItem, submitting, onSubmit }: OrderSummaryProps) {
  const total = items.reduce((sum, item) => {
    const toppingsTotal = item.toppings.reduce((t, tp) => t + tp.priceAtOrder, 0);
    return sum + (item.priceAtOrder + toppingsTotal) * item.quantity;
  }, 0);

  const paymentLabels: Record<string, string> = {
    EFECTIVO: "Efectivo",
    NEQUI: "Nequi",
    DAVIPLATA: "Daviplata",
    LLAVE_BRE_B: "Llave BRE-B",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <h3 style={{ margin: 0 }}>Resumen del pedido</h3>

      {/* Items */}
      {items.length === 0 ? (
        <p style={{ opacity: 0.6, fontSize: 14 }}>No hay items en el pedido.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map((item, i) => {
            const toppingsTotal = item.toppings.reduce((t, tp) => t + tp.priceAtOrder, 0);
            const lineTotal = (item.priceAtOrder + toppingsTotal) * item.quantity;
            return (
              <div key={i} style={{ padding: "8px 10px", background: "#f9fafb", borderRadius: 8, fontSize: 13 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>
                    <strong>{item.productName}</strong> · {item.variantName} × {item.quantity}
                  </span>
                  <span style={{ fontWeight: 600 }}>{formatCop(lineTotal)}</span>
                </div>
                {item.toppings.length > 0 && (
                  <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>
                    +{item.toppings.map((t) => t.toppingName).join(", ")}
                  </div>
                )}
                <button
                  onClick={() => onRemoveItem(i)}
                  style={{ marginTop: 4, fontSize: 11, color: "#e11d48", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                >
                  Quitar
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Customer summary */}
      <div style={{ padding: "8px 10px", background: "#f9fafb", borderRadius: 8, fontSize: 13 }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Datos del cliente</div>
        <div>{customer.name} · {customer.phone}</div>
        <div>{customer.deliveryMethod === "delivery" ? `Domicilio: ${customer.address}` : "Recoger en local"}</div>
        {customer.barrio && <div>Barrio: {customer.barrio}</div>}
      </div>

      {/* Payment */}
      <div style={{ padding: "8px 10px", background: "#f9fafb", borderRadius: 8, fontSize: 13 }}>
        <span style={{ fontWeight: 600 }}>Pago: </span>
        {paymentLabels[paymentMethod] ?? paymentMethod}
      </div>

      {/* Total */}
      <div style={{ padding: 12, background: "#fff1f2", borderRadius: 8, fontWeight: 700, fontSize: 16 }}>
        Total: {formatCop(total)}
      </div>

      {/* Submit */}
      <button
        onClick={onSubmit}
        disabled={items.length === 0 || submitting}
        style={{
          padding: "14px 20px",
          borderRadius: 8,
          border: "none",
          background: items.length === 0 || submitting ? "#ccc" : "#e11d48",
          color: "#fff",
          fontWeight: 600,
          fontSize: 15,
          cursor: items.length === 0 || submitting ? "not-allowed" : "pointer",
        }}
      >
        {submitting ? "Enviando..." : "Confirmar pedido"}
      </button>
    </div>
  );
}
