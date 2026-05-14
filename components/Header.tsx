"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { ShoppingBag } from "lucide-react";

export function Header() {
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex flex-col leading-tight">
          <span className="text-base font-bold tracking-tight" style={{ color: "var(--brand)" }}>
            Free Kitchen
          </span>
          <span className="text-[10px] text-gray-400 tracking-wide uppercase">
            Zero açúcar · Zero glúten
          </span>
        </Link>

        <Link href="/cart" className="relative p-1.5">
          <ShoppingBag className="w-5 h-5 text-gray-700" />
          {count > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold"
              style={{ background: "var(--brand)" }}
            >
              {count}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
