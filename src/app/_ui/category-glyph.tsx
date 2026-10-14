import type { ReactNode } from "react";
import type { CategoryId } from "@/core";

// Drawn stand-in for a product photo, used when a product has no image or it fails to
// load. Shapes are filled with currentColor, so the well's colour tints them.
export function CategoryGlyph({ category }: { category: CategoryId }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 200 200" width="150" height="150">
      <ellipse cx="100" cy="182" rx="56" ry="6" fill="#0F1111" opacity="0.14" />
      {GLYPHS[category]}
    </svg>
  );
}

const HIGHLIGHT = { fill: "#FFFFFF", opacity: 0.35 } as const;

const GLYPHS: Record<CategoryId, ReactNode> = {
  phones: (
    <>
      <rect x="66" y="30" width="68" height="142" rx="14" fill="currentColor" />
      <rect x="73" y="44" width="54" height="112" rx="6" {...HIGHLIGHT} />
      <rect x="90" y="36" width="20" height="4" rx="2" {...HIGHLIGHT} />
    </>
  ),
  tablets: (
    <>
      <rect x="42" y="34" width="116" height="140" rx="12" fill="currentColor" />
      <rect x="50" y="44" width="100" height="120" rx="6" {...HIGHLIGHT} />
    </>
  ),
  laptops: (
    <>
      <rect x="44" y="52" width="112" height="78" rx="6" fill="currentColor" />
      <rect x="51" y="59" width="98" height="64" rx="3" {...HIGHLIGHT} />
      <path d="M26 136h148l-10 16H36z" fill="currentColor" />
    </>
  ),
  audio: (
    <>
      <path
        d="M48 118V96a52 52 0 0 1 104 0v22"
        fill="none"
        stroke="currentColor"
        strokeWidth="11"
        strokeLinecap="round"
      />
      <rect x="30" y="102" width="34" height="70" rx="16" fill="currentColor" />
      <rect x="136" y="102" width="34" height="70" rx="16" fill="currentColor" />
      <rect x="37" y="114" width="5" height="30" rx="2.5" {...HIGHLIGHT} />
    </>
  ),
  "phone-accessories": (
    <>
      <rect x="68" y="56" width="64" height="64" rx="12" fill="currentColor" />
      <rect x="82" y="40" width="8" height="18" rx="3" fill="currentColor" />
      <rect x="110" y="40" width="8" height="18" rx="3" fill="currentColor" />
      <path
        d="M100 120c0 30-40 20-40 52"
        fill="none"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <rect x="78" y="66" width="22" height="5" rx="2.5" {...HIGHLIGHT} />
    </>
  ),
  "computer-accessories": (
    <>
      <rect x="32" y="40" width="136" height="88" rx="6" fill="currentColor" />
      <rect x="40" y="48" width="120" height="72" rx="3" {...HIGHLIGHT} />
      <rect x="92" y="128" width="16" height="28" fill="currentColor" />
      <rect x="66" y="154" width="68" height="10" rx="5" fill="currentColor" />
    </>
  ),
  watches: (
    <>
      <rect x="80" y="26" width="40" height="44" rx="8" fill="currentColor" />
      <rect x="80" y="130" width="40" height="44" rx="8" fill="currentColor" />
      <circle cx="100" cy="100" r="42" fill="currentColor" />
      <circle cx="100" cy="100" r="32" {...HIGHLIGHT} />
      <path
        d="M100 100V78M100 100l14 10"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </>
  ),
  fragrances: (
    <>
      <rect x="86" y="34" width="28" height="22" rx="4" fill="currentColor" />
      <rect x="92" y="54" width="16" height="16" fill="currentColor" />
      <rect x="56" y="68" width="88" height="104" rx="18" fill="currentColor" />
      <rect x="68" y="82" width="10" height="64" rx="5" {...HIGHLIGHT} />
    </>
  ),
  makeup: (
    <>
      <path d="M86 58c0-16 10-28 28-30v40H86z" fill="currentColor" />
      <rect x="80" y="68" width="40" height="26" rx="3" fill="currentColor" opacity="0.8" />
      <rect x="74" y="94" width="52" height="80" rx="6" fill="currentColor" />
      <rect x="82" y="104" width="8" height="58" rx="4" {...HIGHLIGHT} />
    </>
  ),
  skincare: (
    <>
      <rect x="92" y="26" width="16" height="24" rx="3" fill="currentColor" />
      <path d="M100 30h24v8h-24z" fill="currentColor" />
      <rect x="66" y="50" width="68" height="124" rx="20" fill="currentColor" />
      <rect x="78" y="66" width="44" height="40" rx="6" {...HIGHLIGHT} />
    </>
  ),
  groceries: (
    <>
      <path
        d="M100 64c-40-18-70 10-62 52 6 34 30 60 62 48 32 12 56-14 62-48 8-42-22-70-62-52z"
        fill="currentColor"
      />
      <path
        d="M100 64c0-18 6-30 18-38"
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path d="M104 50c12-14 30-14 38-6-12 12-28 12-38 6z" fill="currentColor" />
      <ellipse cx="68" cy="102" rx="8" ry="16" {...HIGHLIGHT} />
    </>
  ),
  kitchenware: (
    <>
      <circle cx="88" cy="112" r="50" fill="currentColor" />
      <circle cx="88" cy="112" r="38" {...HIGHLIGHT} />
      <rect x="132" y="104" width="54" height="16" rx="8" fill="currentColor" />
    </>
  ),
  "home-decor": (
    <>
      <ellipse
        cx="78"
        cy="78"
        rx="14"
        ry="34"
        transform="rotate(-24 78 78)"
        fill="currentColor"
        opacity="0.75"
      />
      <ellipse
        cx="122"
        cy="78"
        rx="14"
        ry="34"
        transform="rotate(24 122 78)"
        fill="currentColor"
        opacity="0.75"
      />
      <ellipse cx="100" cy="66" rx="14" ry="38" fill="currentColor" opacity="0.9" />
      <path d="M58 112h84l-12 62H70z" fill="currentColor" />
      <rect x="66" y="122" width="10" height="36" rx="5" {...HIGHLIGHT} />
    </>
  ),
  furniture: (
    <>
      <rect x="54" y="48" width="92" height="72" rx="14" fill="currentColor" />
      <rect x="40" y="96" width="28" height="64" rx="10" fill="currentColor" />
      <rect x="132" y="96" width="28" height="64" rx="10" fill="currentColor" />
      <rect x="62" y="116" width="76" height="36" rx="8" fill="currentColor" opacity="0.85" />
      <rect x="64" y="58" width="40" height="6" rx="3" {...HIGHLIGHT} />
    </>
  ),
  clothing: (
    <>
      <path
        d="M76 36l-44 22 16 34 18-8v86h68V84l18 8 16-34-44-22c-4 12-14 18-24 18s-20-6-24-18z"
        fill="currentColor"
      />
      <rect x="82" y="98" width="8" height="54" rx="4" {...HIGHLIGHT} />
    </>
  ),
  shoes: (
    <>
      <path
        d="M30 150v-34c0-10 8-16 16-12 22 10 40 6 50-14l8-14c30 28 60 40 70 52 6 8 4 22-6 22H30z"
        fill="currentColor"
      />
      <rect x="30" y="152" width="148" height="12" rx="6" fill="currentColor" opacity="0.8" />
      <path
        d="M96 104l12 10M104 94l12 10"
        stroke="#FFFFFF"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.4"
      />
    </>
  ),
  bags: (
    <>
      <path
        d="M72 78V64a28 28 0 0 1 56 0v14"
        fill="none"
        stroke="currentColor"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <path d="M46 78h108l-8 96H54z" fill="currentColor" />
      <rect x="60" y="90" width="9" height="62" rx="4.5" {...HIGHLIGHT} />
    </>
  ),
  jewellery: (
    <>
      <circle cx="100" cy="118" r="44" fill="none" stroke="currentColor" strokeWidth="14" />
      <path d="M84 52h32l12 16-28 26-28-26z" fill="currentColor" />
      <path d="M90 58h20l6 8H84z" {...HIGHLIGHT} />
    </>
  ),
  sunglasses: (
    <>
      <path d="M20 92h160" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
      <path d="M28 92h60v18c0 18-14 30-30 30s-30-12-30-30z" fill="currentColor" />
      <path d="M112 92h60v18c0 18-14 30-30 30s-30-12-30-30z" fill="currentColor" />
      <path
        d="M40 102c4 12 12 18 22 20M124 102c4 12 12 18 22 20"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.4"
      />
    </>
  ),
  sports: (
    <>
      <circle cx="100" cy="104" r="64" fill="currentColor" />
      <path
        d="M44 84c34 4 66 30 76 80M156 84c-34 4-66 30-76 80M52 60c30 20 66 20 96 0"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="5"
        opacity="0.4"
      />
    </>
  ),
  cars: (
    <>
      <path
        d="M22 142v-24c0-8 6-14 14-16l18-4 24-26c4-4 10-6 16-6h28c6 0 12 4 16 8l20 24 16 4c8 2 14 8 14 16v24z"
        fill="currentColor"
      />
      <path d="M84 78h22v24H64zM114 78h14l18 24h-32z" {...HIGHLIGHT} />
      <circle cx="58" cy="146" r="18" fill="currentColor" />
      <circle cx="142" cy="146" r="18" fill="currentColor" />
      <circle cx="58" cy="146" r="7" {...HIGHLIGHT} />
      <circle cx="142" cy="146" r="7" {...HIGHLIGHT} />
    </>
  ),
  motorcycles: (
    <>
      <circle cx="50" cy="142" r="28" fill="none" stroke="currentColor" strokeWidth="10" />
      <circle cx="150" cy="142" r="28" fill="none" stroke="currentColor" strokeWidth="10" />
      <path
        d="M50 142l30-50h40l30 50M96 92l-10-22h-20M120 92l14-20h20"
        fill="none"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M74 98h56l-8 22H84z" fill="currentColor" />
    </>
  ),
};
