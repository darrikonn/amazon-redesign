"use client";

import { type Ref, useImperativeHandle, useRef, useState } from "react";
import type { CategoryId } from "@/core";
import { CategoryGlyph } from "./category-glyph";
import { Icon } from "./icon";
import styles from "./image-carousel.module.css";
import { prefersReducedMotion } from "./motion";
import { ProductPhoto } from "./product-photo";

export type CarouselControl = {
  step: (direction: -1 | 1) => void;
};

type ImageCarouselProps = {
  ref?: Ref<CarouselControl>;
  images: readonly string[];
  name: string;
  category: CategoryId;
};

// The photos sit side by side in a scroll-snapping track, so touch devices swipe natively;
// the arrows, the dots, and the dialog's arrow keys (through `step`) scroll the same track.
// At either end the arrow stays focusable but does nothing (aria-disabled, not disabled),
// so keyboard focus is never dropped out of the dialog.
export function ImageCarousel({ ref, images, name, category }: ImageCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [shownIndex, setShownIndex] = useState(0);
  const hasSeveral = images.length > 1;
  const isFirst = shownIndex === 0;
  const isLast = shownIndex === images.length - 1;

  function show(index: number) {
    const track = trackRef.current;
    if (track === null) return;
    const clamped = Math.min(Math.max(index, 0), images.length - 1);
    const behavior = prefersReducedMotion() ? "auto" : "smooth";
    track.scrollTo({ left: clamped * track.clientWidth, behavior });
  }

  useImperativeHandle(ref, () => ({ step: (direction) => show(shownIndex + direction) }));

  function followScroll() {
    const track = trackRef.current;
    if (track === null || track.clientWidth === 0) return;
    setShownIndex(Math.round(track.scrollLeft / track.clientWidth));
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
      aria-roledescription={hasSeveral ? "carousel" : undefined}
      aria-label={hasSeveral ? `Photos of ${name}` : `Photo of ${name}`}
    >
      <div ref={trackRef} className={styles.track} onScroll={followScroll}>
        {images.map((image, index) => (
          <figure
            key={image}
            className={styles.slide}
            aria-label={hasSeveral ? `Photo ${index + 1} of ${images.length}` : undefined}
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
            aria-disabled={isFirst}
            onClick={() => show(shownIndex - 1)}
          >
            <Icon name="chevron-right" size={20} strokeWidth={2.8} />
          </button>
          <button
            type="button"
            className={styles.next}
            aria-label="Next photo"
            aria-disabled={isLast}
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

// Every photo loads straight away: they wait off to the side of the track, where lazy
// loading would never start them, and a swipe should land on a photo, not a blank.
function Slide({ image, name, category, isFirst }: SlideProps) {
  return (
    <ProductPhoto
      image={image}
      category={category}
      alt={name}
      sizes="(max-width: 760px) 100vw, 560px"
      className={styles.photo}
      loading="eager"
      priority={isFirst}
    />
  );
}
