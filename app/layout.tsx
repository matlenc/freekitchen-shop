import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { Header } from "@/components/Header";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Free Kitchen — Alimentação Saudável em Porto Alegre",
  description:
    "Chocolates artesanais, kits presente e snacks saudáveis. Zero açúcar, zero glúten, zero lácteos. Entrega em até 5km do Shopping Iguatemi POA.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${geist.className} bg-gray-50 min-h-screen`}>
        <CartProvider>
          <Header />
          <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}
