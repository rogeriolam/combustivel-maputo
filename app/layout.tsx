import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Combustível Maputo",
  description: "MVP mobile-first para sinalização comunitária de combustível em Maputo e Matola."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <body>{children}</body>
    </html>
  );
}
