"use client";

import Image from "next/image";
import { type KeyboardEvent, useRef, useState } from "react";
import type { CategoryId } from "@/core";
import { CategoryGlyph } from "./category-glyph";
import { Icon } from "./icon";
import styles from "./image-carousel.module.css";
import { prefersReducedMotion } from "./motion";

type ImageCarouselProps = {
  images: readonly string[];
  name: string;
  category: CategoryId;
};

// The photos sit side by side in a scroll-snapping track, so touch devices swipe natively;
// the arrows, the arrow keys, and the dots scroll the same track.
export function ImageCarousel({ images, name, category }: ImageCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [shownIndex, setShownIndex] = useState(0);
  const hasSeveral = images.length > 1;

  function show(index: number) {
    const track = trackRef.current;
    if (track === null) return;
    const behavior = prefersReducedMotion() ? "auto" : "smooth";
    track.scrollTo({ left: index * track.clientWidth, behavior });
  }

  function followScroll() {
    const track = trackRef.current;
    if (track === null || track.clientWidth === 0) return;
    setShownIndex(Math.round(track.scrollLeft / track.clientWidth));
  }

  function stepWithKeys(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") show(Math.max(0, shownIndex - 1));
    if (event.key === "ArrowRight") show(Math.min(images.length - 1, shownIndex + 1));
  }

  if (images.length === 0) {
    return (
      <div className={styles.carousel}>
        <div className={styles.glyph}>
          <CategoryGlyph category={category} />
        </div>
      </div>
    );
  }

  return (
    <section
      className={styles.carousel}
      aria-roledescription="carousel"
      aria-label={`Photos of ${name}`}
      onKeyDown={stepWithKeys}
    >
      <div ref={trackRef} className={styles.track} onScroll={followScroll}>
        {images.map((image, index) => (
          <figure
            key={image}
            className={styles.slide}
            aria-label={`Photo ${index + 1} of ${images.length}`}
          >
            <Slide image={image} name={name} category={category} isFirst={index === 0} />
          </figure>
        ))}
      </div>
      {hasSeveral && (
        <>
          <button
            type="button"
            className={styles.previous}
            aria-label="Previous photo"
            disabled={shownIndex === 0}
            onClick={() => show(shownIndex - 1)}
          >
            <Icon name="chevron-right" size={20} strokeWidth={2.8} />
          </button>
          <button
            type="button"
            className={styles.next}
            aria-label="Next photo"
            disabled={shownIndex === images.length - 1}
            onClick={() => show(shownIndex + 1)}
          >
            <Icon name="chevron-right" size={20} strokeWidth={2.8} />
          </button>
          <div className={styles.dots}>
            {images.map((image, index) => (
              <button
                type="button"
                key={image}
                className={index === shownIndex ? styles.dotShown : styles.dot}
                aria-label={`Show photo ${index + 1}`}
                aria-current={index === shownIndex ? "true" : undefined}
                onClick={() => show(index)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

type SlideProps = {
  image: string;
  name: string;
  category: CategoryId;
  isFirst: boolean;
};

// A photo that fails to load falls back to the category glyph, as on the cards.
function Slide({ image, name, category, isFirst }: SlideProps) {
  const [hasFailed, setHasFailed] = useState(false);
  if (hasFailed) {
    return (
      <div className={styles.glyph}>
        <CategoryGlyph category={category} />
      </div>
    );
  }
  return (
    <Image
      src={image}
      alt={name}
      fill
      sizes="(max-width: 760px) 100vw, 560px"
      className={styles.photo}
      priority={isFirst}
      onError={() => setHasFailed(true)}
    />
  );
}
