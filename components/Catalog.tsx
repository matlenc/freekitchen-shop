"use client";

import { useState } from "react";
import { Product, Category } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";
import { useCart } from "@/lib/cart-context";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

const filters: Array<{ key: "all" | Category; label: string }> = [
  { key: "all", label: "Todos" },
  { key: "kits", label: "Kits" },
  { key: "chocolates", label: "Chocolates" },
  { key: "presenteáveis", label: "Presenteáveis" },
  { key: "snacks", label: "Snacks" },
];

export function Catalog({ products }: { products: Product[] }) {
  const [active, setActive] = useState<"all" | Category>("all");
  const { count, total } = useCart();

  const filtered = active === "all" ? products : products.filter((p) => p.category === active);

  return (
    <div className="pb-24">
      <div className="pt-5 pb-4 px-4 max-w-2xl mx-auto">
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Porto Alegre · Iguatemi</p>
        <h1 className="text-xl font-bold text-gray-900 leading-snug">
          Coloque coisa gostosa<br />no seu dia
        </h1>
      </div>

      <div className="px-4 max-w-2xl mx-auto">
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setActive(f.key)}
              className="whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={
                active === f.key
                  ? { background: "var(--brand)", color: "white" }
                  : { background: "white", color: "#555", border: "1px solid #e5e7eb" }
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-3 max-w-2xl mx-auto grid grid-cols-2 gap-3">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {count > 0 && (
        <div className="fixed bottom-5 left-0 right-0 flex justify-center px-4 z-50">
          <Link
            href="/cart"
            className="flex items-center gap-3 text-white px-5 py-3.5 rounded-2xl shadow-xl w-full max-w-sm"
            style={{ background: "var(--brand)" }}
          >
            <ShoppingBag className="w-4 h-4 flex-shrink-0" />
            <span className="font-semibold flex-1 text-sm">Ver carrinho ({count})</span>
            <span className="font-bold text-sm">
              R$ {total.toFixed(2).replace(".", ",")}
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}
