"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, MapPin } from "lucide-react";
import { Suspense } from "react";

function ConfirmadoContent() {
  const params = useSearchParams();
  const id = params.get("id");
  const method = params.get("method");

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 flex flex-col items-center gap-6 text-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "var(--brand-light)" }}>
        <CheckCircle className="w-8 h-8" style={{ color: "var(--brand)" }} />
      </div>

      <div>
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Pedido recebido</p>
        <h1 className="text-2xl font-bold text-gray-900">Tudo certo!</h1>
        {id && (
          <p className="text-sm text-gray-400 mt-1">
            Pedido <span className="font-semibold text-gray-600">{id}</span>
          </p>
        )}
      </div>

      <div className="bg-white rounded-2xl p-5 w-full max-w-sm space-y-3 text-left">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "var(--brand-light)" }}>
            <Package className="w-4 h-4" style={{ color: "var(--brand)" }} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">
              {method === "pix" ? "Aguardando confirmação do PIX" : "Pagamento na entrega"}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {method === "pix"
                ? "Assim que o pagamento for confirmado, iniciaremos o preparo."
                : "Tenha o valor em mãos ou cartão para o entregador."}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "var(--brand-light)" }}>
            <MapPin className="w-4 h-4" style={{ color: "var(--brand)" }} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Entrega em andamento</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Entraremos em contato pelo WhatsApp para confirmar os detalhes.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 w-full max-w-sm">
        {id && (
          <Link
            href={`/acompanhar`}
            className="w-full text-center py-3 rounded-2xl text-sm font-semibold border-2"
            style={{ borderColor: "var(--brand)", color: "var(--brand)" }}
          >
            Acompanhar pedido
          </Link>
        )}
        <Link
          href="/"
          className="text-sm font-semibold"
          style={{ color: "var(--brand)" }}
        >
          Voltar ao catálogo
        </Link>
      </div>
    </div>
  );
}

export default function ConfirmadoPage() {
  return (
    <Suspense>
      <ConfirmadoContent />
    </Suspense>
  );
}
