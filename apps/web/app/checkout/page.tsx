"use client";
import { Suspense, useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductPicker, CartItem } from "../../components/orders/checkout/ProductPicker";
import { CustomerForm, CustomerData } from "../../components/orders/checkout/CustomerForm";
import { PaymentForm } from "../../components/orders/checkout/PaymentForm";
import { OrderSummary } from "../../components/orders/checkout/OrderSummary";

type Step = "cart" | "customer" | "payment" | "review";
type PaymentMethod = "EFECTIVO" | "NEQUI" | "DAVIPLATA" | "LLAVE_BRE_B";

const EMPTY_CUSTOMER: CustomerData = {
  name: "",
  phone: "",
  address: "",
  barrio: "",
  reference: "",
  notes: "",
  deliveryMethod: "pickup",
};

function CheckoutInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>("cart");
  const [items, setItems] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<CustomerData>(EMPTY_CUSTOMER);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("EFECTIVO");
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [orderCode, setOrderCode] = useState<string | null>(null);
  const [preselected, setPreselected] = useState(false);

  // Read variant+toppings from URL params (from "Hacer Pedido" link)
  const initialVariant = searchParams.get("variant");
  const initialToppings = searchParams.get("toppings");

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => [...prev, item]);
  }, []);

  const removeItem = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const validateCustomer = (): boolean => {
    const e: Partial<Record<string, string>> = {};
    if (customer.name.trim().length < 2) e.name = "Nombre requerido (mín. 2 caracteres)";
    if (customer.phone.trim().length < 10) e.phone = "Teléfono requerido (mín. 10 dígitos)";
    if (customer.deliveryMethod === "delivery" && !customer.address.trim()) e.address = "Dirección requerida para domicilio";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goNext = () => {
    if (step === "cart") {
      if (items.length === 0) {
        setErrors({ cart: "Agregá al menos un producto" });
        return;
      }
      setErrors({});
      setStep("customer");
      return;
    }
    if (step === "customer") {
      if (validateCustomer()) setStep("payment");
      return;
    }
    if (step === "payment") { setStep("review"); return; }
  };

  const goBack = () => {
    if (step === "customer") setStep("cart");
    else if (step === "payment") setStep("customer");
    else if (step === "review") setStep("payment");
  };

  const handleSubmit = async () => {
    if (items.length === 0) return;
    setSubmitting(true);
    try {
      const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
      const res = await fetch(`${base}/api/v1/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            productName: item.productName,
            variantName: item.variantName,
            priceAtOrder: item.priceAtOrder,
            quantity: item.quantity,
            toppings: item.toppings,
          })),
          customer: {
            name: customer.name.trim(),
            phone: customer.phone.trim(),
            address: customer.deliveryMethod === "delivery" ? customer.address.trim() : undefined,
            barrio: customer.barrio.trim() || undefined,
            reference: customer.reference.trim() || undefined,
            notes: customer.notes.trim() || undefined,
          },
          deliveryMethod: customer.deliveryMethod,
          paymentMethod,
          origin: "ONLINE",
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? "Error al crear el pedido");
      }
      const data = await res.json();
      setOrderCode(data.code);
    } catch (err: any) {
      setErrors({ submit: err.message ?? "Error de conexión" });
    } finally {
      setSubmitting(false);
    }
  };

  // Success state
  if (orderCode) {
    return (
      <main style={{ padding: "2rem", maxWidth: 480, margin: "0 auto", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🍓</div>
        <h1 style={{ marginBottom: 8 }}>¡Pedido recibido!</h1>
        <p style={{ fontSize: 14, opacity: 0.7, marginBottom: 16 }}>Tu código de seguimiento:</p>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: 2, marginBottom: 24, padding: "12px 20px", background: "#fff1f2", borderRadius: 8, display: "inline-block" }}>
          {orderCode}
        </div>
        <p style={{ fontSize: 14, marginBottom: 24 }}>Te contactaremos pronto para confirmar tu pedido.</p>
        <button
          onClick={() => router.push(`/tracking/${orderCode}`)}
          style={{
            padding: "12px 24px",
            borderRadius: 8,
            border: "2px solid #e11d48",
            background: "#fff",
            color: "#e11d48",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Seguir mi pedido
        </button>
      </main>
    );
  }

  const stepIndex = { cart: 0, customer: 1, payment: 2, review: 3 }[step];

  return (
    <main style={{ padding: "1rem", maxWidth: 480, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 4 }}>Mi Pedido</h1>

      {/* Progress bar */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
        {["Carrito", "Datos", "Pago", "Resumen"].map((label, i) => (
          <div key={label} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= stepIndex ? "#e11d48" : "#eee" }} />
        ))}
      </div>

      {/* Step content */}
      {step === "cart" && (
        <>
          <ProductPicker onAddItem={addItem} initialVariantId={initialVariant} initialToppings={initialToppings} />
          {errors.cart && (
            <div style={{ marginTop: 8, padding: 8, background: "#fef2f2", borderRadius: 8, color: "#e11d48", fontSize: 13 }}>
              {errors.cart}
            </div>
          )}
          {items.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <h3 style={{ margin: "0 0 8px" }}>Tu pedido ({items.length} items)</h3>
              {items.map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #eee", fontSize: 13 }}>
                  <span>{item.productName} · {item.variantName} × {item.quantity}</span>
                  <button onClick={() => removeItem(i)} style={{ fontSize: 11, color: "#e11d48", background: "none", border: "none", cursor: "pointer" }}>
                    Quitar
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {step === "customer" && <CustomerForm value={customer} onChange={setCustomer} errors={errors} />}
      {step === "payment" && <PaymentForm value={paymentMethod} onChange={setPaymentMethod} />}
      {step === "review" && <OrderSummary items={items} customer={customer} paymentMethod={paymentMethod} onRemoveItem={removeItem} onSubmit={handleSubmit} submitting={submitting} />}

      {errors.submit && (
        <div style={{ marginTop: 12, padding: 10, background: "#fef2f2", borderRadius: 8, color: "#e11d48", fontSize: 13 }}>
          {errors.submit}
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
        {step !== "cart" && step !== "review" && (
          <button
            onClick={goBack}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: 8,
              border: "1px solid #ddd",
              background: "#fff",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            ← Atrás
          </button>
        )}
        {step !== "review" && (
          <button
            onClick={goNext}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: 8,
              border: "none",
              background: "#e11d48",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            Continuar →
          </button>
        )}
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<main style={{ padding: "2rem", textAlign: "center" }}>Cargando...</main>}>
      <CheckoutInner />
    </Suspense>
  );
}
