import { getKosList } from "@/lib/data";
import KosExplorer from "./ProductExplorer";

// Komponen server: mengambil data kos lalu meneruskannya ke komponen interaktif.
export default async function Product() {
  const kos = await getKosList();
  return (
    <div id="kos" className="scroll-mt-16">
      <KosExplorer items={kos} />
    </div>
  );
}