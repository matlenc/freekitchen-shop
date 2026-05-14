import { NextResponse } from "next/server";
import { getProducts } from "@/lib/products-db";

export async function GET() {
  return NextResponse.json(await getProducts());
}
