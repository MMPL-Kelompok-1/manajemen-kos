import { getKosList } from "@/lib/data";
import ProductExplorer from "./ProductExplorer";

// Komponen server: mengambil data kos lalu meneruskannya ke komponen interaktif.
export default async function Product() {
  const kos = await getKosList();
<<<<<<< HEAD
  return <ProductExplorer items={kos} />;
}

=======
  return (
    <div id="kos" className="scroll-mt-16">
      <KosExplorer items={kos} />
    </div>
  );
}
>>>>>>> 2db62be14abb3a32b728180e758ec395fa26984a
