import { NextRequest, NextResponse } from "next/server";
import { updateOrderStatus, OrderStatus } from "@/lib/orders-db";

function isAuthorized(req: NextRequest) {
  return req.headers.get("x-admin-token") === process.env.ADMIN_PASSWORD;
}

export async function PATCH(req: NextRequest, context: { params: Promise<unknown> }) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = (await context.params) as { id: string };
  const { status } = await req.json();
  const order = await updateOrderStatus(id, status as OrderStatus);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(order);
}
