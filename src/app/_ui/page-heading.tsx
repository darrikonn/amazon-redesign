import type { ReactNode, Ref } from "react";
import page from "./shop-page.module.css";
import type { ShopPlace } from "./shop-place";

type PageHeadingProps = {
  place: ShopPlace;
  lede?: ReactNode;
  // Given when the page moves focus to its heading, after removing what was focused.
  titleRef?: Ref<HTMLHeadingElement>;
  // Controls that sit beside the title, such as the order tabs.
  children?: ReactNode;
};

// A page's title is its place's name (ADR 0031), so it reads the same as every link to it.
export function PageHeading({ place, lede, titleRef, children }: PageHeadingProps) {
  return (
    <div className={page.heading}>
      <div>
        <h1
          ref={titleRef}
          className={page.title}
          tabIndex={titleRef === undefined ? undefined : -1}
        >
          {place.title}
        </h1>
        {lede !== undefined && <p className={page.lede}>{lede}</p>}
      </div>
      {children}
    </div>
  );
}
