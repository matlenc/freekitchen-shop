import { NextRequest, NextResponse } from "next/server";
import { getOrders } from "@/lib/orders-db";

function isAuthorized(req: NextRequest) {
  return req.headers.get("x-admin-token") === process.env.ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orders = (await getOrders()).reverse();
  return NextResponse.json(orders);
}
