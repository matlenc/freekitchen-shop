export type Category = "kits" | "chocolates" | "snacks" | "presenteáveis";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: Category;
  image: string;
  badge?: string | null;
  visible: boolean;
  inStock: boolean;
}

export const categoryLabels: Record<Category, string> = {
  kits: "Kits Presente",
  chocolates: "Chocolates",
  snacks: "Snacks",
  "presenteáveis": "Presenteáveis",
};
