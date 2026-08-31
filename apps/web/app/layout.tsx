import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MAISON FRAISE — Fresas con Crema",
  description: "Fresas con crema artesanales en Sabanalarga — pedidos privados",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif" }}>{children}</body>
    </html>
  );
}
