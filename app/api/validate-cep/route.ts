import { NextRequest, NextResponse } from "next/server";
import { validateCep } from "@/lib/delivery";

export async function POST(req: NextRequest) {
  const { cep } = await req.json();
  const result = await validateCep(cep);
  return NextResponse.json(result);
}
