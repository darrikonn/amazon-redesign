"use client";

import Image from "next/image";
import { useState } from "react";
import type { CategoryId } from "@/core";
import { CategoryGlyph } from "./category-glyph";
import styles from "./product-thumbnail.module.css";

type ProductThumbnailProps = {
  image: string | null;
  category: CategoryId;
  size?: "small" | "large";
};

// Decorative, like the card photos (ADR 0023): the product's name always sits beside it.
export function ProductThumbnail({ image, category, size = "small" }: ProductThumbnailProps) {
  const [hasFailed, setHasFailed] = useState(false);
  return (
    <span className={size === "large" ? styles.large : styles.small}>
      {image === null || hasFailed ? (
        <CategoryGlyph category={category} />
      ) : (
        <Image
          src={image}
          alt=""
          fill
          sizes={size === "large" ? "120px" : "72px"}
          className={styles.photo}
          onError={() => setHasFailed(true)}
        />
      )}
    </span>
  );
}
