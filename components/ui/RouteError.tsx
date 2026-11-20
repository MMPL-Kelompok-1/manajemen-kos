"use client";

import { useEffect } from "react";
import EmptyState from "@/components/ui/EmptyState";

// Tampilan gagal muat untuk error.tsx: layout kosong, dua baris, satu tombol sekunder.
export default function RouteError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto w-full max-w-[800px] px-5 py-8 md:px-6">
      <EmptyState
        role="alert"
        headingLevel="h1"
        title="Data tidak bisa dimuat"
        description="Periksa koneksi internet, lalu coba lagi. Jika masih gagal, muat ulang halaman."
        action={
          <button type="button" onClick={() => retry()} className="btn btn-secondary">
            Coba lagi
          </button>
        }
      />
    </div>
  );
}
