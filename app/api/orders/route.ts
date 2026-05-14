import { NextRequest, NextResponse } from "next/server";
import { createOrder, getOrdersByPhone } from "@/lib/orders-db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const order = await createOrder(body);

  const items = order.items.map((i) => `${i.quantity}x ${i.name}`).join(", ");
  const msg = encodeURIComponent(
    `*Novo pedido ${order.id}!*\n\n${items}\n\nTotal: R$ ${order.total.toFixed(2).replace(".", ",")}\nPagamento: ${order.paymentMethod === "pix" ? "PIX" : "Pagar na entrega"}\n\nCliente: ${order.customer.name} (${order.customer.phone})\nEndereço: ${order.address.logradouro}, ${order.address.number} — ${order.address.bairro}`
  );
  console.log(`\n🛍️  Novo pedido: ${order.id}`);
  console.log(`👉  https://wa.me/${process.env.WHATSAPP_NOTIFY}?text=${msg}\n`);

  return NextResponse.json(order);
}

export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get("phone");
  if (!phone) return NextResponse.json({ error: "phone required" }, { status: 400 });
  return NextResponse.json(await getOrdersByPhone(phone));
}
