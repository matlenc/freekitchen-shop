import { NextRequest, NextResponse } from "next/server";
import MercadoPago, { Payment } from "mercadopago";

const client = new MercadoPago({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.type !== "payment") return NextResponse.json({ ok: true });

  const payment = new Payment(client);
  const data = await payment.get({ id: body.data.id });

  if (data.status === "approved") {
    const notifyNumber = process.env.WHATSAPP_NOTIFY;
    const description = data.description ?? "Pedido Free Kitchen";
    const total = data.transaction_amount?.toFixed(2).replace(".", ",");
    const msg = encodeURIComponent(
      `*Novo pedido pago!* \n\n${description}\n\nTotal: R$ ${total}\nPagamento: PIX confirmado`
    );

    // Log para rastrear pagamento confirmado
    console.log(
      `[webhook] Pagamento ${data.id} aprovado — notificar ${notifyNumber}`
    );
    console.log(`[webhook] WA link: https://wa.me/${notifyNumber}?text=${msg}`);
  }

  return NextResponse.json({ ok: true });
}
