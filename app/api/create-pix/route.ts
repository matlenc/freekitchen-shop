import { NextRequest, NextResponse } from "next/server";
import MercadoPago, { Payment } from "mercadopago";

const client = new MercadoPago({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export async function POST(req: NextRequest) {
  const { items, customer, total } = await req.json();

  const description = items
    .map((i: { name: string; quantity: number }) => `${i.quantity}x ${i.name}`)
    .join(", ");

  const payment = new Payment(client);

  const result = await payment.create({
    body: {
      transaction_amount: total,
      description: `Free Kitchen — ${description}`,
      payment_method_id: "pix",
      payer: {
        email: customer.email,
        first_name: customer.name.split(" ")[0],
        last_name: customer.name.split(" ").slice(1).join(" ") || "-",
      },
      notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhook`,
    },
  });

  const pix = result.point_of_interaction?.transaction_data;

  return NextResponse.json({
    id: result.id,
    status: result.status,
    qr_code: pix?.qr_code,
    qr_code_base64: pix?.qr_code_base64,
  });
}
