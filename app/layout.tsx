import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Combustível Moçambique",
  description: "Plataforma mobile-first para sinalização comunitária de combustível em Moçambique."
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
