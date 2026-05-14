"use client";

import { useState, useEffect, useRef } from "react";
import { Product, categoryLabels } from "@/data/products";
import { Order, OrderStatus } from "@/lib/orders-db";
import Image from "next/image";
import {
  Eye,
  EyeOff,
  Package,
  PackageX,
  Upload,
  Lock,
  LogOut,
  Pencil,
  Check,
  X,
  ShoppingBag,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
} from "lucide-react";

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "confirmado", label: "Confirmado" },
  { value: "em_preparo", label: "Em preparo" },
  { value: "saiu_entrega", label: "Saiu para entrega" },
  { value: "entregue", label: "Entregue" },
  { value: "cancelado", label: "Cancelado" },
];

const STATUS_COLORS: Record<OrderStatus, string> = {
  confirmado: "#6b7280",
  em_preparo: "#d97706",
  saiu_entrega: "#2563eb",
  entregue: "#1b4332",
  cancelado: "#dc2626",
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [authError, setAuthError] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<"products" | "orders">("orders");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState<Partial<Product>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  async function login() {
    setLoading(true);
    const res = await fetch("/api/products");
    if (res.ok) {
      const data = await res.json();
      const verifyRes = await fetch("/api/admin/products/" + data[0]?.id, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": password,
        },
        body: JSON.stringify({}),
      });
      if (verifyRes.status !== 401) {
        setToken(password);
        setProducts(data);
        setAuthError(false);
        loadOrders(password);
      } else {
        setAuthError(true);
      }
    }
    setLoading(false);
  }

  async function loadProducts() {
    const res = await fetch("/api/products");
    setProducts(await res.json());
  }

  async function loadOrders(t?: string) {
    const res = await fetch("/api/admin/orders", {
      headers: { "x-admin-token": t ?? token! },
    });
    if (res.ok) setOrders(await res.json());
  }

  async function updateStatus(id: string, status: OrderStatus) {
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-token": token! },
      body: JSON.stringify({ status }),
    });
    await loadOrders();
  }

  async function patchProduct(id: string, patch: Partial<Product>) {
    await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-token": token!,
      },
      body: JSON.stringify(patch),
    });
    await loadProducts();
  }

  async function handleImageUpload(productId: string, file: File) {
    setUploadingId(productId);
    const form = new FormData();
    form.append("file", file);
    form.append("productId", productId);
    await fetch("/api/admin/upload", {
      method: "POST",
      headers: { "x-admin-token": token! },
      body: form,
    });
    setUploadingId(null);
    await loadProducts();
  }

  function startEdit(product: Product) {
    setEditingId(product.id);
    setEditFields({
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      description: product.description,
      badge: product.badge ?? "",
    });
  }

  async function saveEdit(id: string) {
    await patchProduct(id, editFields);
    setEditingId(null);
    setEditFields({});
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 w-full max-w-sm space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-700 font-semibold">
            <Lock className="w-4 h-4 text-green-600" />
            Admin — Free Kitchen
          </div>
          <input
            type="password"
            placeholder="Senha de acesso"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          {authError && (
            <p className="text-red-500 text-xs">Senha incorreta</p>
          )}
          <button
            onClick={login}
            disabled={loading || !password}
            className="w-full bg-green-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Admin</h1>
        <button
          onClick={() => setToken(null)}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600"
        >
          <LogOut className="w-4 h-4" /> Sair
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {([
          { key: "orders", label: "Pedidos", icon: <ShoppingBag className="w-3.5 h-3.5" /> },
          { key: "products", label: "Produtos", icon: <Package className="w-3.5 h-3.5" /> },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); if (tab.key === "orders") loadOrders(); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={activeTab === tab.key
              ? { background: "var(--brand)", color: "white" }
              : { background: "white", color: "#6b7280", border: "1px solid #e5e7eb" }}
          >
            {tab.icon}{tab.label}
            {tab.key === "orders" && orders.filter(o => o.status === "confirmado" || o.status === "em_preparo").length > 0 && (
              <span className="ml-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {orders.filter(o => o.status === "confirmado" || o.status === "em_preparo").length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <div className="space-y-3">
          {orders.length === 0 ? (
            <div className="text-center py-12 text-sm text-gray-400">Nenhum pedido ainda</div>
          ) : (
            [...orders].reverse().map((order) => {
              const date = new Date(order.createdAt).toLocaleDateString("pt-BR", {
                day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
              });
              const statusColor = STATUS_COLORS[order.status];
              return (
                <div key={order.id} className="bg-white rounded-2xl p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{order.id}</p>
                      <p className="text-xs text-gray-400">{date} · {order.paymentMethod === "pix" ? "PIX" : "Na entrega"}</p>
                    </div>
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
                      className="text-xs font-semibold px-2 py-1.5 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-green-700"
                      style={{ background: `${statusColor}15`, color: statusColor }}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-0.5">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-xs text-gray-500">
                        <span>{item.quantity}x {item.name}</span>
                        <span>R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between text-sm font-bold text-gray-800 border-t border-gray-100 pt-2">
                    <span>Total</span>
                    <span>R$ {order.total.toFixed(2).replace(".", ",")}</span>
                  </div>

                  <div className="text-xs text-gray-400 space-y-0.5">
                    <p className="font-medium text-gray-600">{order.customer.name} · {order.customer.phone}</p>
                    <p>{order.address.logradouro}, {order.address.number}{order.address.complement ? `, ${order.address.complement}` : ""} — {order.address.bairro}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Products Tab */}
      {activeTab === "products" && <div className="grid gap-4">
        {products.map((product) => {
          const isEditing = editingId === product.id;
          const isUploading = uploadingId === product.id;

          return (
            <div
              key={product.id}
              className={`bg-white rounded-2xl border p-4 flex gap-4 transition-all ${
                !product.visible ? "opacity-60 border-gray-100" : "border-gray-200"
              }`}
            >
              {/* Imagem com upload */}
              <div className="relative flex-shrink-0">
                <div
                  className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-50 cursor-pointer group"
                  onClick={() => {
                    fileInputRef.current?.click();
                    fileInputRef.current?.setAttribute("data-id", product.id);
                  }}
                >
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.jpg";
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    {isUploading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 text-white" />
                    )}
                  </div>
                </div>
              </div>

              {/* Conteúdo */}
              <div className="flex-1 min-w-0 space-y-2">
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      value={editFields.name ?? ""}
                      onChange={(e) =>
                        setEditFields((f) => ({ ...f, name: e.target.value }))
                      }
                      className="w-full border border-gray-200 rounded-lg px-2 py-1 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-green-400"
                    />
                    <textarea
                      value={editFields.description ?? ""}
                      onChange={(e) =>
                        setEditFields((f) => ({
                          ...f,
                          description: e.target.value,
                        }))
                      }
                      rows={2}
                      className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-500 focus:outline-none focus:ring-1 focus:ring-green-400 resize-none"
                    />
                    <div className="flex gap-2">
                      <div>
                        <label className="text-xs text-gray-400">Preço</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editFields.price ?? ""}
                          onChange={(e) =>
                            setEditFields((f) => ({
                              ...f,
                              price: parseFloat(e.target.value),
                            }))
                          }
                          className="w-24 border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-green-400"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400">
                          Preço original
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={editFields.originalPrice ?? ""}
                          onChange={(e) =>
                            setEditFields((f) => ({
                              ...f,
                              originalPrice: e.target.value
                                ? parseFloat(e.target.value)
                                : undefined,
                            }))
                          }
                          className="w-24 border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-green-400"
                          placeholder="Opcional"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400">Badge</label>
                        <input
                          value={editFields.badge ?? ""}
                          onChange={(e) =>
                            setEditFields((f) => ({
                              ...f,
                              badge: e.target.value || null,
                            }))
                          }
                          className="w-28 border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-green-400"
                          placeholder="Ex: Novo"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(product.id)}
                        className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-green-700"
                      >
                        <Check className="w-3 h-3" /> Salvar
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex items-center gap-1 bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-semibold hover:bg-gray-200"
                      >
                        <X className="w-3 h-3" /> Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-sm text-gray-800 leading-snug">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {categoryLabels[product.category]}
                          {product.badge && (
                            <span className="ml-1.5 bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full text-[10px] font-medium">
                              {product.badge}
                            </span>
                          )}
                        </p>
                      </div>
                      <button
                        onClick={() => startEdit(product)}
                        className="text-gray-300 hover:text-gray-500 flex-shrink-0"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-green-700">
                        R$ {product.price.toFixed(2).replace(".", ",")}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs text-gray-400 line-through">
                          R${" "}
                          {product.originalPrice.toFixed(2).replace(".", ",")}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Toggles */}
              {!isEditing && (
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() =>
                      patchProduct(product.id, { visible: !product.visible })
                    }
                    title={product.visible ? "Ocultar produto" : "Mostrar produto"}
                    className={`p-2 rounded-xl transition-colors ${
                      product.visible
                        ? "bg-green-50 text-green-600 hover:bg-green-100"
                        : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                    }`}
                  >
                    {product.visible ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() =>
                      patchProduct(product.id, { inStock: !product.inStock })
                    }
                    title={product.inStock ? "Marcar sem estoque" : "Marcar com estoque"}
                    className={`p-2 rounded-xl transition-colors ${
                      product.inStock
                        ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                        : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                    }`}
                  >
                    {product.inStock ? (
                      <Package className="w-4 h-4" />
                    ) : (
                      <PackageX className="w-4 h-4" />
                    )}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>}

      {/* Input de arquivo global (hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          const id = fileInputRef.current?.getAttribute("data-id");
          if (file && id) handleImageUpload(id, file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
