import { getKosList } from "@/lib/data";
import KosExplorer from "./ProductExplorer";

// Komponen server: mengambil data kos lalu meneruskannya ke komponen interaktif.
export default async function Product() {
  const kos = await getKosList();
  return <KosExplorer items={kos} />;
}
