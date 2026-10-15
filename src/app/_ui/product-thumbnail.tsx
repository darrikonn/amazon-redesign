"use client";

import type { CategoryId } from "@/core";
import { ProductPhoto } from "./product-photo";
import styles from "./product-thumbnail.module.css";

type ProductThumbnailProps = {
  image: string | null;
  category: CategoryId;
  size?: "small" | "large";
};

// Decorative, like the card photos (ADR 0023): the product's name always sits beside it.
export function ProductThumbnail({ image, category, size = "small" }: ProductThumbnailProps) {
  return (
    <span className={size === "large" ? styles.large : styles.small}>
      <ProductPhoto
        image={image}
        category={category}
        alt=""
        sizes={size === "large" ? "120px" : "72px"}
        className={styles.photo}
      />
    </span>
  );
}
