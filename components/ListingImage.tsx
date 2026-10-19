"use client";

import { useEffect, useRef, useState } from "react";

// Menampilkan foto properti. Jika file belum ada, tampilkan placeholder abu-abu.
export default function ListingImage({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Error gambar bisa terjadi sebelum hydration selesai, sehingga event onError terlewat.
  // Periksa status gambar setelah mount.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, [src]);

  if (!src || failed) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-muted px-3 text-center text-sm text-muted-foreground ${className}`}
      >
        {alt}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className={`h-full w-full object-cover ${className}`}
    />
  );
}
