import { NextRequest, NextResponse } from "next/server";
import { updateProduct } from "@/lib/products-db";

function isAuthorized(req: NextRequest) {
  const token = req.headers.get("x-admin-token");
  return token === process.env.ADMIN_PASSWORD;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file") as File;
  const productId = form.get("productId") as string;

  if (!file || !productId) {
    return NextResponse.json({ error: "Missing file or productId" }, { status: 400 });
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const buffer = Buffer.from(await file.arrayBuffer());
  const imageUrl = `data:image/${ext};base64,${buffer.toString("base64")}`;
  await updateProduct(productId, { image: imageUrl });

  return NextResponse.json({ imageUrl });
}
