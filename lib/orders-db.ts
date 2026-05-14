import fs from "fs";
import path from "path";
import { Redis } from "@upstash/redis";

export type OrderStatus =
  | "confirmado"
  | "em_preparo"
  | "saiu_entrega"
  | "entregue"
  | "cancelado";

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  createdAt: string;
  customer: { name: string; phone: string; email?: string };
  address: {
    logradouro: string;
    number: string;
    complement?: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
  };
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: "pix" | "delivery";
  status: OrderStatus;
}

const redis =
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
    ? new Redis({
        url: process.env.KV_REST_API_URL,
        token: process.env.KV_REST_API_TOKEN,
      })
    : null;

const DB_PATH = path.join(process.cwd(), "data", "orders.json");

async function readOrders(): Promise<Order[]> {
  if (redis) {
    return (await redis.get<Order[]>("orders")) ?? [];
  }
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
  } catch {
    return [];
  }
}

async function writeOrders(orders: Order[]): Promise<void> {
  if (redis) {
    await redis.set("orders", orders);
    return;
  }
  fs.writeFileSync(DB_PATH, JSON.stringify(orders, null, 2));
}

export async function getOrders(): Promise<Order[]> {
  return readOrders();
}

export async function createOrder(
  data: Omit<Order, "id" | "createdAt" | "status">
): Promise<Order> {
  const orders = await readOrders();
  const id = `FK-${String(orders.length + 1).padStart(3, "0")}`;
  const order: Order = {
    ...data,
    id,
    createdAt: new Date().toISOString(),
    status: "confirmado",
  };
  orders.push(order);
  await writeOrders(orders);
  return order;
}

export async function getOrderById(id: string): Promise<Order | null> {
  const orders = await readOrders();
  return orders.find((o) => o.id === id) ?? null;
}

export async function getOrdersByPhone(phone: string): Promise<Order[]> {
  const orders = await readOrders();
  const cleaned = phone.replace(/\D/g, "");
  return orders.filter(
    (o) => o.customer.phone.replace(/\D/g, "") === cleaned
  );
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<Order | null> {
  const orders = await readOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return null;
  orders[idx].status = status;
  await writeOrders(orders);
  return orders[idx];
}
