"use client";

import Image from "next/image";
import { useState } from "react";
import type { CategoryId } from "@/core";
import { CategoryGlyph } from "./category-glyph";

type ProductPhotoProps = {
  image: string | null;
  category: CategoryId;
  alt: string;
  sizes: string;
  className: string | undefined;
  loading?: "eager" | "lazy";
  priority?: boolean;
};

// Fills its positioned parent. A missing or failing photo is replaced by the category glyph
// rather than shown broken (ADR 0023).
export function ProductPhoto({
  image,
  category,
  alt,
  sizes,
  className,
  loading = "lazy",
  priority = false,
}: ProductPhotoProps) {
  const [hasFailed, setHasFailed] = useState(false);
  if (image === null || hasFailed) return <CategoryGlyph category={category} />;
  return (
    <Image
      src={image}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      loading={loading}
      priority={priority}
      onError={() => setHasFailed(true)}
    />
  );
}
