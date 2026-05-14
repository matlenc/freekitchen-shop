import { NextRequest, NextResponse } from "next/server";
import { updateProduct } from "@/lib/products-db";

function isAuthorized(req: NextRequest) {
  return req.headers.get("x-admin-token") === process.env.ADMIN_PASSWORD;
}

export async function PATCH(req: NextRequest, context: { params: Promise<unknown> }) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = (await context.params) as { id: string };
  const patch = await req.json();
  const updated = await updateProduct(id, patch);
  if (!updated) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  return NextResponse.json(updated);
}
