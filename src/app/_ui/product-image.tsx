"use client";

import Image from "next/image";
import { useState } from "react";
import type { CategoryId } from "@/core";
import { CategoryGlyph } from "./category-glyph";
import styles from "./product-card.module.css";

type ProductImageProps = {
  image: string | null;
  category: CategoryId;
};

// The photo is decorative (the title sits right below it), so it carries no alt text,
// and a missing or failing image is replaced by the category glyph rather than shown broken.
export function ProductImage({ image, category }: ProductImageProps) {
  const [hasFailed, setHasFailed] = useState(false);
  if (image === null || hasFailed) return <CategoryGlyph category={category} />;
  return (
    <span className={styles.photoFrame}>
      <Image
        src={image}
        alt=""
        fill
        sizes="(max-width: 760px) 45vw, 300px"
        className={styles.photo}
        onError={() => setHasFailed(true)}
      />
    </span>
  );
}
