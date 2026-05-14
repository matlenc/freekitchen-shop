"use client";

import { useCart } from "@/lib/cart-context";
import { DELIVERY_FEE } from "@/lib/delivery";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ArrowLeft, ArrowRight } from "lucide-react";

export default function CartPage() {
  const { items, remove, updateQty, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-gray-400">Carrinho vazio</p>
        <Link href="/" className="text-sm font-semibold flex items-center gap-1" style={{ color: "var(--brand)" }}>
          <ArrowLeft className="w-4 h-4" /> Ver produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-bold text-gray-900">Seu pedido</h1>
      </div>

      <div className="space-y-2">
        {items.map(({ product, quantity }) => (
          <div key={product.id} className="bg-white rounded-2xl p-3 flex gap-3 items-center">
            <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
              <Image src={product.image} alt={product.name} fill className="object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.jpg"; }} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 line-clamp-1">{product.name}</p>
              <p className="text-sm font-bold mt-0.5" style={{ color: "var(--brand)" }}>
                R$ {(product.price * quantity).toFixed(2).replace(".", ",")}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <button onClick={() => updateQty(product.id, quantity - 1)}
                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                {quantity === 1
                  ? <Trash2 className="w-3 h-3 text-gray-400" />
                  : <Minus className="w-3 h-3 text-gray-600" />}
              </button>
              <span className="text-sm font-bold w-4 text-center">{quantity}</span>
              <button onClick={() => updateQty(product.id, quantity + 1)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-white"
                style={{ background: "var(--brand)" }}>
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-4 space-y-2 text-sm">
        <div className="flex justify-between text-gray-500">
          <span>Subtotal</span>
          <span>R$ {total.toFixed(2).replace(".", ",")}</span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>Entrega</span>
          <span>R$ {DELIVERY_FEE.toFixed(2).replace(".", ",")}</span>
        </div>
        <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-900 text-base">
          <span>Total</span>
          <span>R$ {(total + DELIVERY_FEE).toFixed(2).replace(".", ",")}</span>
        </div>
      </div>

      <Link href="/checkout"
        className="flex items-center justify-center gap-2 w-full text-white py-3.5 rounded-2xl font-semibold text-sm"
        style={{ background: "var(--brand)" }}>
        Finalizar pedido <ArrowRight className="w-4 h-4" />
      </Link>

      <Link href="/acompanhar" className="block text-center text-xs text-gray-400 underline">
        Acompanhar pedido existente
      </Link>
    </div>
  );
}
