import Image from "next/image";
import Link from "next/link";

function formatCop(cents: number): string {
  return `$${cents.toLocaleString("es-CO")}`;
}

export function ProductCard({ product }: { product: any }) {
  const cover = product.images?.[0]?.url ?? "/placeholder.jpg";
  return (
    <Link href={`/catalog/${product.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
      <div style={{ border: "1px solid #eee", borderRadius: 12, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ position: "relative", width: "100%", aspectRatio: "1/1", background: "#fafafa" }}>
          <Image src={cover} alt={product.name} fill style={{ objectFit: "cover" }} sizes="(max-width: 768px) 100vw, 33vw" />
        </div>
        <div style={{ padding: 12 }}>
          <h3 style={{ margin: 0, fontSize: 16 }}>{product.name}</h3>
          {product.description && <p style={{ margin: "4px 0", fontSize: 13, opacity: 0.7 }}>{product.description}</p>}
          {product.variants?.[0] && <p style={{ margin: "4px 0", fontWeight: 600 }}>{formatCop(product.variants[0].priceCents)}</p>}
        </div>
      </div>
    </Link>
  );
}
