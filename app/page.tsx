import { getVisibleProducts } from "@/lib/products-db";
import { Catalog } from "@/components/Catalog";

export default async function Home() {
  const products = await getVisibleProducts();
  return <Catalog products={products} />;
}
