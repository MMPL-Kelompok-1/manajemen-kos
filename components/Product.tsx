import { getKosList } from "@/lib/data";
import ProductExplorer from "./ProductExplorer";

// Komponen server: mengambil data kos lalu meneruskannya ke komponen interaktif.
export default async function Product() {
  const kos = await getKosList();
  return <ProductExplorer items={kos} />;
}

