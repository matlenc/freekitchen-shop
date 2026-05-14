"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { DELIVERY_FEE } from "@/lib/delivery";
import { ArrowLeft, Loader2, Copy, CheckCheck, MapPin, User, CreditCard } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

type Step = "form" | "pix";
type PaymentMethod = "pix" | "delivery";

interface AddressData { logradouro: string; bairro: string; cidade: string; uf: string; cep: string; }

export default function CheckoutPage() {
  const { items, total, clear } = useCart();
  const router = useRouter();

  const [step, setStep] = useState<Step>("form");
  const [cep, setCep] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [address, setAddress] = useState<AddressData | null>(null);
  const [cepError, setCepError] = useState("");
  const [loadingCep, setLoadingCep] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("pix");
  const [pixData, setPixData] = useState<{ qr_code: string; qr_code_base64: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const orderTotal = total + DELIVERY_FEE;
  const canSubmit = address && number && name && phone && (method !== "pix" || email);

  async function handleCep(value: string) {
    const cleaned = value.replace(/\D/g, "");
    setCep(value);
    setCepError("");
    setAddress(null);
    if (cleaned.length === 8) {
      setLoadingCep(true);
      const res = await fetch("/api/validate-cep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cep: cleaned }),
      });
      const data = await res.json();
      setLoadingCep(false);
      if (data.valid) setAddress(data.address);
      else setCepError(data.error ?? "CEP fora da área de entrega");
    }
  }

  async function handleSubmit() {
    if (!canSubmit) return;
    setLoading(true);

    const orderPayload = {
      customer: { name, phone, email },
      address: { ...address!, number, complement },
      items: items.map((i) => ({ id: i.product.id, name: i.product.name, quantity: i.quantity, price: i.product.price })),
      subtotal: total,
      deliveryFee: DELIVERY_FEE,
      total: orderTotal,
      paymentMethod: method,
    };

    if (method === "delivery") {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });
      const order = await res.json();
      setLoading(false);
      clear();
      router.push(`/confirmado?id=${order.id}&method=delivery`);
      return;
    }

    // PIX
    const pixRes = await fetch("/api/create-pix", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: orderPayload.items, customer: { name, email, phone }, total: orderTotal }),
    });
    const pix = await pixRes.json();

    // Salva o pedido também
    await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...orderPayload, pixId: pix.id }),
    });

    setLoading(false);
    setPixData(pix);
    setStep("pix");
  }

  if (items.length === 0 && step !== "pix") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 flex flex-col items-center gap-4">
        <p className="text-gray-400 text-sm">Carrinho vazio</p>
        <Link href="/" className="text-sm font-semibold" style={{ color: "var(--brand)" }}>Ver produtos</Link>
      </div>
    );
  }

  if (step === "pix") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col items-center gap-5">
        <div className="text-center">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Pagamento</p>
          <h2 className="text-xl font-bold text-gray-900">Pague com PIX</h2>
          <p className="text-sm text-gray-500 mt-1">R$ {orderTotal.toFixed(2).replace(".", ",")} · Confirmação instantânea</p>
        </div>

        {pixData?.qr_code_base64 ? (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <Image src={`data:image/png;base64,${pixData.qr_code_base64}`} alt="QR Code PIX" width={200} height={200} className="mx-auto" />
          </div>
        ) : <div className="w-52 h-52 bg-gray-100 rounded-2xl animate-pulse" />}

        <button onClick={async () => {
          await navigator.clipboard.writeText(pixData?.qr_code ?? "");
          setCopied(true); setTimeout(() => setCopied(false), 2000);
        }}
          className="flex items-center gap-2 w-full max-w-xs bg-white border border-gray-200 px-4 py-3 rounded-xl text-sm font-medium text-gray-700">
          {copied ? <CheckCheck className="w-4 h-4" style={{ color: "var(--brand)" }} /> : <Copy className="w-4 h-4" />}
          {copied ? "Copiado!" : "Copiar código PIX"}
        </button>

        <p className="text-xs text-gray-400 text-center max-w-xs">
          Após o pagamento, entraremos em contato para confirmar a entrega.
        </p>

        <Link href="/" onClick={clear} className="text-xs font-semibold" style={{ color: "var(--brand)" }}>
          Voltar ao início
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/cart" className="text-gray-400"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-lg font-bold text-gray-900">Finalizar pedido</h1>
      </div>

      {/* Endereço */}
      <section className="bg-white rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <MapPin className="w-4 h-4" style={{ color: "var(--brand)" }} />
          Endereço de entrega
        </div>

        <div>
          <label className="text-xs text-gray-400 font-medium">CEP</label>
          <div className="relative mt-1">
            <input type="text" placeholder="00000-000" value={cep} onChange={(e) => handleCep(e.target.value)}
              maxLength={9}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-700" />
            {loadingCep && <Loader2 className="absolute right-3 top-3 w-4 h-4 text-gray-400 animate-spin" />}
          </div>
          {cepError && <p className="text-red-500 text-xs mt-1">{cepError}</p>}
        </div>

        {address && (
          <>
            <div className="rounded-xl px-3 py-2.5 text-xs font-medium" style={{ background: "var(--brand-light)", color: "var(--brand)" }}>
              {address.logradouro}, {address.bairro} — {address.cidade}/{address.uf}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-400 font-medium">Número</label>
                <input type="text" value={number} onChange={(e) => setNumber(e.target.value)} placeholder="123"
                  className="mt-1 w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-700" />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-medium">Complemento</label>
                <input type="text" value={complement} onChange={(e) => setComplement(e.target.value)} placeholder="Apto..."
                  className="mt-1 w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-700" />
              </div>
            </div>
          </>
        )}
      </section>

      {/* Dados pessoais */}
      {address && number && (
        <section className="bg-white rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <User className="w-4 h-4" style={{ color: "var(--brand)" }} />
            Seus dados
          </div>
          {[
            { label: "Nome completo", val: name, set: setName, type: "text", ph: "Seu nome" },
            { label: "WhatsApp", val: phone, set: setPhone, type: "tel", ph: "(51) 99999-9999" },
            ...(method === "pix" ? [{ label: "E-mail", val: email, set: setEmail, type: "email", ph: "seu@email.com" }] : []),
          ].map((f) => (
            <div key={f.label}>
              <label className="text-xs text-gray-400 font-medium">{f.label}</label>
              <input type={f.type} value={f.val} onChange={(e) => f.set(e.target.value)} placeholder={f.ph}
                className="mt-1 w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-700" />
            </div>
          ))}
        </section>
      )}

      {/* Pagamento */}
      {address && number && name && phone && (
        <section className="bg-white rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <CreditCard className="w-4 h-4" style={{ color: "var(--brand)" }} />
            Pagamento
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(["pix", "delivery"] as PaymentMethod[]).map((m) => (
              <button key={m} onClick={() => setMethod(m)}
                className="p-3 rounded-xl border-2 text-left transition-all"
                style={method === m
                  ? { borderColor: "var(--brand)", background: "var(--brand-light)" }
                  : { borderColor: "#e5e7eb", background: "white" }}>
                <p className="text-sm font-semibold" style={method === m ? { color: "var(--brand)" } : { color: "#374151" }}>
                  {m === "pix" ? "PIX" : "Na entrega"}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {m === "pix" ? "QR Code gerado aqui" : "Dinheiro ou maquininha"}
                </p>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Resumo + botão */}
      {canSubmit && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl p-4 text-sm space-y-2">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span><span>R$ {total.toFixed(2).replace(".", ",")}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Entrega</span><span>R$ {DELIVERY_FEE.toFixed(2).replace(".", ",")}</span>
            </div>
            <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-900 text-base">
              <span>Total</span><span>R$ {orderTotal.toFixed(2).replace(".", ",")}</span>
            </div>
          </div>

          <button onClick={handleSubmit} disabled={loading}
            className="w-full text-white py-3.5 rounded-2xl font-semibold text-sm disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ background: "var(--brand)" }}>
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" />{method === "pix" ? "Gerando PIX..." : "Confirmando..."}</>
              : method === "pix" ? "Gerar QR Code PIX" : "Confirmar pedido"}
          </button>
        </div>
      )}
    </div>
  );
}
