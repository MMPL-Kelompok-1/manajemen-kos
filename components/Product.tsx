import { getKosList } from "@/lib/data";
import ProductExplorer from "./ProductExplorer";

export default async function Product() {
  const kos = await getKosList();
  return <ProductExplorer items={kos} />;
}

