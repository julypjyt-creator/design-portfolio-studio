"use client";

import Image from "next/image";
import { useState } from "react";

export function WorkGallery({ images, name }: { images: string[]; name: string }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images.length) return null;

  return (
    <div className="space-y-3">
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl2 border border-line bg-white">
        <Image src={images[activeIndex]} alt={`${name} 图 ${activeIndex + 1}`} fill className="object-cover" />
      </div>
      <div className="grid grid-cols-4 gap-3">
        {images.map((image, index) => (
          <button
            key={image}
            className={`relative aspect-[4/3] overflow-hidden rounded-lg border ${
              activeIndex === index ? "border-accent" : "border-line"
            }`}
            onClick={() => setActiveIndex(index)}
          >
            <Image src={image} alt={`${name} 缩略图 ${index + 1}`} fill className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
