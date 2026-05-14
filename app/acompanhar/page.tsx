"use client";

import { useState } from "react";
import { Order } from "@/lib/orders-db";
import { Loader2, Search, Package, Clock, Truck, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const STATUS_MAP: Record<Order["status"], { label: string; icon: React.ReactNode; color: string }> = {
  confirmado: {
    label: "Confirmado",
    icon: <Clock className="w-4 h-4" />,
    color: "#6b7280",
  },
  em_preparo: {
    label: "Em preparo",
    icon: <Package className="w-4 h-4" />,
    color: "#d97706",
  },
  saiu_entrega: {
    label: "Saiu para entrega",
    icon: <Truck className="w-4 h-4" />,
    color: "#2563eb",
  },
  entregue: {
    label: "Entregue",
    icon: <CheckCircle className="w-4 h-4" />,
    color: "var(--brand)",
  },
  cancelado: {
    label: "Cancelado",
    icon: <XCircle className="w-4 h-4" />,
    color: "#dc2626",
  },
};

export default function AcompanharPage() {
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch() {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length < 8) return;
    setLoading(true);
    const res = await fetch(`/api/orders?phone=${cleaned}`);
    const data = await res.json();
    setOrders(Array.isArray(data) ? data : []);
    setSearched(true);
    setLoading(false);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/" className="text-gray-400"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-lg font-bold text-gray-900">Acompanhar pedido</h1>
      </div>

      <section className="bg-white rounded-2xl p-4 space-y-3">
        <p className="text-sm text-gray-500">
          Digite o WhatsApp usado no pedido para ver o status.
        </p>
        <div className="flex gap-2">
          <input
            type="tel"
            placeholder="(51) 99999-9999"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center gap-1.5 disabled:opacity-60"
            style={{ background: "var(--brand)" }}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Buscar
          </button>
        </div>
      </section>

      {searched && orders !== null && (
        orders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-400">Nenhum pedido encontrado para este número.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {[...orders].reverse().map((order) => {
              const status = STATUS_MAP[order.status];
              const date = new Date(order.createdAt).toLocaleDateString("pt-BR", {
                day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
              });

              return (
                <div key={order.id} className="bg-white rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{order.id}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{date}</p>
                    </div>
                    <span
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
                      style={{ background: `${status.color}15`, color: status.color }}
                    >
                      {status.icon}
                      {status.label}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-xs text-gray-500">
                        <span>{item.quantity}x {item.name}</span>
                        <span>R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-100 pt-2 flex justify-between text-sm font-bold text-gray-800">
                    <span>Total</span>
                    <span>R$ {order.total.toFixed(2).replace(".", ",")}</span>
                  </div>

                  <div className="text-xs text-gray-400">
                    {order.address.logradouro}, {order.address.number}
                    {order.address.complement ? `, ${order.address.complement}` : ""} — {order.address.bairro}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
