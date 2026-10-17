import { getKosList } from "@/lib/data";
import KosExplorer from "./KosExplorer";

// Komponen server: mengambil data kos lalu meneruskannya ke komponen interaktif.
export default async function KosSection() {
  const kos = await getKosList();
  return <KosExplorer kos={kos} />;
}
