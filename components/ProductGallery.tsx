"use client";

import { useState } from "react";
import ListingImage from "./ListingImage";

export default function ProductGallery({ photos, name }: { photos: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const list = photos.length > 0 ? photos : [""];

  return (
    <div id="product-gallery">
      <div className="aspect-[16/10] overflow-hidden rounded-feature bg-well">
        <ListingImage src={list[active]} alt={`${name} - foto ${active + 1}`} />
      </div>

      {list.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-2 sm:gap-3">
          {list.map((photo, index) => (
            <button
              key={`${photo}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Lihat foto ${index + 1}`}
              className={`aspect-[4/3] overflow-hidden rounded-control transition-[opacity,box-shadow] duration-150 ${index === active ? "ring-2 ring-ink-12" : "opacity-70 hover:opacity-100"}`}
            >
              <ListingImage src={photo} alt={`Foto ${index + 1}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
