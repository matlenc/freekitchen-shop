"use client";

import { Product } from "@/data/products";
import { useCart } from "@/lib/cart-context";
import { Plus, Check } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export function ProductCard({ product }: { product: Product }) {
  const { add, items } = useCart();
  const [added, setAdded] = useState(false);
  const qty = items.find((i) => i.product.id === product.id)?.quantity ?? 0;

  function handleAdd() {
    add(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden flex flex-col shadow-sm">
      <div className="relative w-full aspect-square bg-gray-50">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
          onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.jpg"; }}
        />
        {product.badge && (
          <span
            className="absolute top-2 left-2 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: "var(--brand)" }}
          >
            {product.badge}
          </span>
        )}
        {qty > 0 && (
          <span
            className="absolute top-2 right-2 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
            style={{ background: "var(--brand-mid)" }}
          >
            {qty}
          </span>
        )}
      </div>

      <div className="p-3 flex flex-col flex-1 gap-2">
        <p className="text-xs font-semibold text-gray-800 leading-snug line-clamp-2 flex-1">
          {product.name}
        </p>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-bold" style={{ color: "var(--brand)" }}>
              R$ {product.price.toFixed(2).replace(".", ",")}
            </span>
            {product.originalPrice && (
              <span className="text-[11px] text-gray-400 line-through ml-1">
                R$ {product.originalPrice.toFixed(2).replace(".", ",")}
              </span>
            )}
          </div>

          <button
            onClick={handleAdd}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90"
            style={{
              background: added ? "var(--brand-light)" : "var(--brand)",
            }}
          >
            {added
              ? <Check className="w-3.5 h-3.5" style={{ color: "var(--brand)" }} />
              : <Plus className="w-3.5 h-3.5 text-white" />
            }
          </button>
        </div>
      </div>
    </div>
  );
}
