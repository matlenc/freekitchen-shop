import fs from "fs";
import path from "path";
import { Product } from "@/data/products";
import { Redis } from "@upstash/redis";

const redis =
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
    ? new Redis({
        url: process.env.KV_REST_API_URL,
        token: process.env.KV_REST_API_TOKEN,
      })
    : null;

const DB_PATH = path.join(process.cwd(), "data", "products.json");

function readFromFile(): Product[] {
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw);
}

export async function getProducts(): Promise<Product[]> {
  if (redis) {
    const cached = await redis.get<Product[]>("products");
    if (cached && cached.length > 0) return cached;
    // Primeira vez: carrega do arquivo e salva no Redis
    const products = readFromFile();
    await redis.set("products", products);
    return products;
  }
  return readFromFile();
}

export async function saveProducts(products: Product[]): Promise<void> {
  if (redis) {
    await redis.set("products", products);
    return;
  }
  fs.writeFileSync(DB_PATH, JSON.stringify(products, null, 2));
}

export async function updateProduct(
  id: string,
  patch: Partial<Product>
): Promise<Product | null> {
  const products = await getProducts();
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  products[idx] = { ...products[idx], ...patch };
  await saveProducts(products);
  return products[idx];
}

export async function getVisibleProducts(): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((p) => p.visible && p.inStock);
}
