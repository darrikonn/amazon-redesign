import type { ReactNode } from "react";
import type { IllustrationShape } from "@/core";

export const GLOW_GRADIENT_ID = "product-glow";

export function ProductIllustration({
  shape,
  isMirrored,
}: {
  shape: IllustrationShape;
  isMirrored: boolean;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 200 200"
      width="190"
      height="190"
      style={{ transform: isMirrored ? "scaleX(-1)" : "none" }}
    >
      {SHAPES[shape]}
    </svg>
  );
}

// Shared once per page so every lamp can reference the same light cone gradient.
export function GlowGradient() {
  return (
    <svg aria-hidden="true" width="0" height="0" style={{ position: "absolute" }}>
      <defs>
        <linearGradient id={GLOW_GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFD814" stopOpacity="0.6" />
          <stop offset="1" stopColor="#FFD814" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const SHAPES: Record<IllustrationShape, ReactNode> = {
  "led-desk-lamp": (
    <>
      <ellipse cx="100" cy="180" rx="56" ry="6" fill="#0F1111" opacity="0.140" />
      <path d="M92 76 130 92 148 170H58z" fill="url(#product-glow) #FFF1A8" />
      <path
        d="M96 168 74 108 114 66"
        fill="none"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="74" cy="108" r="9" fill="currentColor" />
      <circle cx="74" cy="108" r="3.500" fill="#FFFFFF" opacity="0.450" />
      <path
        d="M100 44 146 64 134 92 88 72z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinejoin="round"
      />
      <path
        d="M102 50 138 66"
        stroke="#FFFFFF"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.250"
      />
      <rect x="60" y="166" width="72" height="13" rx="6.500" fill="currentColor" />
      <rect x="68" y="169" width="28" height="3" rx="1.500" fill="#FFFFFF" opacity="0.300" />
    </>
  ),
  "swing-arm-lamp": (
    <>
      <ellipse cx="100" cy="180" rx="58" ry="6" fill="#0F1111" opacity="0.140" />
      <g transform="translate(9 0)">
        <path d="M54 92h60l24 84H30z" fill="url(#product-glow) #FFF1A8" />
        <path
          d="M134 160 150 102 86 60"
          fill="none"
          stroke="currentColor"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M140 150 153 106" stroke="currentColor" strokeWidth="2.500" opacity="0.600" />
        <circle cx="150" cy="102" r="8" fill="currentColor" />
        <circle cx="150" cy="102" r="3" fill="#FFFFFF" opacity="0.450" />
        <path
          d="M70 50h28a6 6 0 0 1 6 4l12 34a4 4 0 0 1-4 5H56a4 4 0 0 1-4-5l12-34a6 6 0 0 1 6-4z"
          fill="currentColor"
        />
        <path
          d="M72 58l-7 22"
          stroke="#FFFFFF"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.300"
        />
        <rect x="118" y="158" width="34" height="22" rx="5" fill="currentColor" />
        <rect x="118" y="166" width="24" height="6" fill="#FFFFFF" opacity="0.850" />
      </g>
    </>
  ),
  "gooseneck-lamp": (
    <>
      <ellipse cx="100" cy="180" rx="40" ry="6" fill="#0F1111" opacity="0.140" />
      <path d="M96 60 138 74 150 150H70z" fill="url(#product-glow) #FFF1A8" />
      <path
        d="M100 150C100 112 58 116 66 82 71 62 92 54 112 60"
        fill="none"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M100 150C100 112 58 116 66 82"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeDasharray="2 6"
        strokeLinecap="round"
        opacity="0.450"
      />
      <path
        d="M106 40 144 54 134 80 98 66z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinejoin="round"
      />
      <path
        d="M80 148h40a6 6 0 0 1 6 6v20a6 6 0 0 1-6 6H80a6 6 0 0 1-6-6v-20a6 6 0 0 1 6-6z"
        fill="currentColor"
      />
      <rect x="74" y="160" width="34" height="8" fill="#FFFFFF" opacity="0.850" />
      <rect x="112" y="154" width="5" height="18" rx="2.500" fill="#FFFFFF" opacity="0.300" />
    </>
  ),
  "monitor-light-bar": (
    <>
      <ellipse cx="100" cy="180" rx="50" ry="6" fill="#0F1111" opacity="0.140" />
      <rect x="40" y="66" width="120" height="84" rx="9" fill="#0F1111" opacity="0.160" />
      <rect x="48" y="74" width="104" height="68" rx="4" fill="#FFFFFF" opacity="0.550" />
      <path d="M52 62h96l10 56H42z" fill="url(#product-glow) #FFF1A8" />
      <rect x="92" y="150" width="16" height="20" fill="#0F1111" opacity="0.160" />
      <rect x="68" y="168" width="64" height="9" rx="4.500" fill="#0F1111" opacity="0.200" />
      <rect x="46" y="46" width="108" height="16" rx="8" fill="currentColor" />
      <rect x="54" y="50" width="40" height="3" rx="1.500" fill="#FFFFFF" opacity="0.350" />
      <rect x="88" y="56" width="24" height="16" rx="4" fill="currentColor" />
    </>
  ),
  "bankers-lamp": (
    <>
      <ellipse cx="100" cy="180" rx="50" ry="6" fill="#0F1111" opacity="0.140" />
      <path d="M58 84h84l26 90H32z" fill="url(#product-glow) #FFF1A8" />
      <rect x="96" y="80" width="8" height="84" fill="currentColor" />
      <path
        d="M66 42h68a8 8 0 0 1 7 5l14 30a6 6 0 0 1-5 9H50a6 6 0 0 1-5-9l14-30a8 8 0 0 1 7-5z"
        fill="currentColor"
      />
      <path d="M68 50h30" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" opacity="0.350" />
      <path d="M122 86v20" stroke="currentColor" strokeWidth="2" />
      <circle cx="122" cy="108" r="3" fill="currentColor" />
      <path d="M74 166a26 10 0 0 1 52 0v6a6 6 0 0 1-6 6H80a6 6 0 0 1-6-6z" fill="currentColor" />
      <rect x="82" y="166" width="20" height="3" rx="1.500" fill="#FFFFFF" opacity="0.350" />
    </>
  ),
  "charging-base-lamp": (
    <>
      <ellipse cx="100" cy="180" rx="58" ry="6" fill="#0F1111" opacity="0.140" />
      <path d="M84 60h62l14 106H70z" fill="url(#product-glow) #FFF1A8" />
      <rect x="58" y="44" width="10" height="124" rx="5" fill="currentColor" />
      <rect x="58" y="44" width="96" height="12" rx="6" fill="currentColor" />
      <rect x="84" y="54" width="62" height="6" rx="3" fill="#FFFFFF" opacity="0.800" />
      <rect x="44" y="164" width="112" height="14" rx="7" fill="currentColor" />
      <circle
        cx="116"
        cy="171"
        r="13"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2"
        opacity="0.500"
      />
      <rect x="61" y="60" width="3" height="60" rx="1.500" fill="#FFFFFF" opacity="0.300" />
    </>
  ),
  "tripod-lamp": (
    <>
      <ellipse cx="100" cy="180" rx="54" ry="6" fill="#0F1111" opacity="0.140" />
      <path d="M60 86h80l22 88H38z" fill="url(#product-glow) #FFF1A8" />
      <path
        d="M100 88 66 176M100 88v88M100 88l34 88"
        fill="none"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <circle cx="100" cy="92" r="8" fill="currentColor" />
      <path
        d="M70 36h60a6 6 0 0 1 6 5l8 40a5 5 0 0 1-5 6H61a5 5 0 0 1-5-6l8-40a6 6 0 0 1 6-5z"
        fill="#F4EFE4"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path
        d="M74 46l-5 30"
        stroke="#0F1111"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.120"
      />
    </>
  ),
  "over-ear-headphones": (
    <>
      <ellipse cx="100" cy="180" rx="62" ry="6" fill="#0F1111" opacity="0.140" />
      <path
        d="M48 118V96a52 52 0 0 1 104 0v22"
        fill="none"
        stroke="currentColor"
        strokeWidth="11"
        strokeLinecap="round"
      />
      <path
        d="M56 94a44 44 0 0 1 30-40"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.300"
      />
      <rect x="30" y="102" width="34" height="70" rx="16" fill="currentColor" />
      <rect x="136" y="102" width="34" height="70" rx="16" fill="currentColor" />
      <rect x="56" y="110" width="12" height="54" rx="6" fill="#0F1111" opacity="0.350" />
      <rect x="132" y="110" width="12" height="54" rx="6" fill="#0F1111" opacity="0.350" />
      <rect x="37" y="114" width="5" height="30" rx="2.500" fill="#FFFFFF" opacity="0.300" />
    </>
  ),
  "earbuds-with-case": (
    <>
      <ellipse cx="100" cy="180" rx="48" ry="6" fill="#0F1111" opacity="0.140" />
      <circle cx="74" cy="56" r="17" fill="currentColor" />
      <rect x="66" y="56" width="13" height="40" rx="6.500" fill="currentColor" />
      <circle cx="68" cy="52" r="6" fill="#0F1111" opacity="0.350" />
      <circle cx="126" cy="56" r="17" fill="currentColor" />
      <rect x="121" y="56" width="13" height="40" rx="6.500" fill="currentColor" />
      <circle cx="132" cy="52" r="6" fill="#0F1111" opacity="0.350" />
      <rect x="56" y="108" width="88" height="68" rx="24" fill="currentColor" />
      <path d="M56 134h88" stroke="#0F1111" strokeWidth="3" opacity="0.220" />
      <circle cx="100" cy="150" r="4" fill="#FF9900" />
      <rect x="68" y="116" width="30" height="4" rx="2" fill="#FFFFFF" opacity="0.350" />
    </>
  ),
  "sport-earbuds": (
    <>
      <ellipse cx="100" cy="180" rx="58" ry="6" fill="#0F1111" opacity="0.140" />
      <path
        d="M66 112Q100 190 134 112"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.650"
      />
      <path
        d="M62 60a26 26 0 1 0-8 48"
        fill="none"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M138 60a26 26 0 1 1 8 48"
        fill="none"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <rect x="50" y="62" width="34" height="50" rx="17" fill="currentColor" />
      <rect x="116" y="62" width="34" height="50" rx="17" fill="currentColor" />
      <circle cx="67" cy="80" r="8" fill="#FFFFFF" opacity="0.300" />
      <circle cx="133" cy="80" r="8" fill="#FFFFFF" opacity="0.300" />
      <rect x="60" y="110" width="14" height="12" rx="5" fill="#0F1111" opacity="0.350" />
      <rect x="126" y="110" width="14" height="12" rx="5" fill="#0F1111" opacity="0.350" />
    </>
  ),
  "studio-headphones": (
    <>
      <ellipse cx="100" cy="180" rx="62" ry="6" fill="#0F1111" opacity="0.140" />
      <path
        d="M50 112V92a50 50 0 0 1 100 0v20"
        fill="none"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M58 100V94a42 42 0 0 1 84 0v6"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.550"
      />
      <circle cx="48" cy="132" r="28" fill="currentColor" />
      <circle cx="152" cy="132" r="28" fill="currentColor" />
      <circle cx="48" cy="132" r="15" fill="#0F1111" opacity="0.300" />
      <circle cx="152" cy="132" r="15" fill="#0F1111" opacity="0.300" />
      <circle cx="48" cy="132" r="5" fill="#FFFFFF" opacity="0.450" />
      <circle cx="152" cy="132" r="5" fill="#FFFFFF" opacity="0.450" />
      <path
        d="M48 160c0 22 30 4 34 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </>
  ),
  "folding-headphones": (
    <>
      <ellipse cx="100" cy="180" rx="44" ry="6" fill="#0F1111" opacity="0.140" />
      <path
        d="M66 100V78a34 34 0 0 1 68 0v22"
        fill="none"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <circle cx="66" cy="72" r="5" fill="#FFFFFF" opacity="0.500" />
      <circle cx="134" cy="72" r="5" fill="#FFFFFF" opacity="0.500" />
      <rect
        x="62"
        y="96"
        width="34"
        height="76"
        rx="17"
        fill="currentColor"
        transform="rotate(14 79 134)"
      />
      <rect
        x="104"
        y="96"
        width="34"
        height="76"
        rx="17"
        fill="currentColor"
        transform="rotate(-14 121 134)"
      />
      <rect
        x="74"
        y="108"
        width="12"
        height="52"
        rx="6"
        fill="#0F1111"
        opacity="0.300"
        transform="rotate(14 79 134)"
      />
      <rect
        x="114"
        y="108"
        width="12"
        height="52"
        rx="6"
        fill="#0F1111"
        opacity="0.300"
        transform="rotate(-14 121 134)"
      />
    </>
  ),
  "laptop-backpack": (
    <>
      <ellipse cx="100" cy="180" rx="56" ry="6" fill="#0F1111" opacity="0.140" />
      <path
        d="M82 52v-8a18 18 0 0 1 36 0v8"
        fill="none"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <rect x="50" y="46" width="100" height="132" rx="30" fill="currentColor" />
      <path d="M50 94q50 18 100 0" fill="none" stroke="#0F1111" strokeWidth="3" opacity="0.220" />
      <rect x="68" y="112" width="64" height="48" rx="12" fill="#0F1111" opacity="0.180" />
      <path d="M78 126h44" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.550" />
      <rect x="59" y="62" width="6" height="26" rx="3" fill="#FFFFFF" opacity="0.250" />
      <rect x="94" y="66" width="12" height="16" rx="3" fill="#FFFFFF" opacity="0.350" />
    </>
  ),
  "roll-top-backpack": (
    <>
      <ellipse cx="100" cy="180" rx="54" ry="6" fill="#0F1111" opacity="0.140" />
      <rect x="54" y="62" width="92" height="116" rx="20" fill="currentColor" />
      <rect x="46" y="34" width="108" height="34" rx="17" fill="currentColor" />
      <path d="M56 46h88M56 56h88" stroke="#0F1111" strokeWidth="2.500" opacity="0.200" />
      <rect x="56" y="38" width="46" height="4" rx="2" fill="#FFFFFF" opacity="0.300" />
      <rect x="94" y="62" width="12" height="60" fill="#0F1111" opacity="0.220" />
      <rect x="90" y="116" width="20" height="14" rx="4" fill="#FFFFFF" opacity="0.650" />
      <rect x="70" y="140" width="60" height="26" rx="8" fill="#0F1111" opacity="0.160" />
      <rect x="62" y="80" width="5" height="40" rx="2.500" fill="#FFFFFF" opacity="0.220" />
    </>
  ),
  daypack: (
    <>
      <ellipse cx="100" cy="180" rx="48" ry="6" fill="#0F1111" opacity="0.140" />
      <path
        d="M88 48v-6a12 12 0 0 1 24 0v6"
        fill="none"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M100 40c34 0 46 40 46 86 0 34-14 52-46 52s-46-18-46-52c0-46 12-86 46-86z"
        fill="currentColor"
      />
      <path
        d="M66 92q34 22 68 0"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.450"
      />
      <path
        d="M72 128h56v22a14 14 0 0 1-14 14H86a14 14 0 0 1-14-14z"
        fill="#0F1111"
        opacity="0.170"
      />
      <circle cx="100" cy="146" r="7" fill="#FFFFFF" opacity="0.550" />
      <path
        d="M70 66q6-14 16-18"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.280"
      />
    </>
  ),
  "travel-backpack": (
    <>
      <ellipse cx="100" cy="180" rx="62" ry="6" fill="#0F1111" opacity="0.140" />
      <path
        d="M84 44v-6a8 8 0 0 1 8-8h16a8 8 0 0 1 8 8v6"
        fill="none"
        stroke="currentColor"
        strokeWidth="7"
      />
      <rect x="40" y="42" width="120" height="136" rx="18" fill="currentColor" />
      <path d="M40 84h120" stroke="#0F1111" strokeWidth="3" opacity="0.220" />
      <rect x="64" y="42" width="12" height="136" fill="#0F1111" opacity="0.180" />
      <rect x="124" y="42" width="12" height="136" fill="#0F1111" opacity="0.180" />
      <rect x="61" y="100" width="18" height="12" rx="3" fill="#FFFFFF" opacity="0.600" />
      <rect x="121" y="100" width="18" height="12" rx="3" fill="#FFFFFF" opacity="0.600" />
      <rect x="88" y="54" width="24" height="14" rx="4" fill="#FFFFFF" opacity="0.350" />
      <rect x="48" y="52" width="5" height="26" rx="2.500" fill="#FFFFFF" opacity="0.220" />
    </>
  ),
  "drip-coffee-maker": (
    <>
      <ellipse cx="100" cy="180" rx="60" ry="6" fill="#0F1111" opacity="0.140" />
      <path
        d="M50 42a10 10 0 0 1 10-10h76a10 10 0 0 1 10 10v24H84v84h66a8 8 0 0 1 8 8v12a8 8 0 0 1-8 8H60a10 10 0 0 1-10-10z"
        fill="currentColor"
      />
      <rect x="58" y="42" width="5" height="100" rx="2.500" fill="#FFFFFF" opacity="0.250" />
      <circle cx="130" cy="49" r="5" fill="#FF9900" />
      <rect x="108" y="66" width="14" height="10" fill="currentColor" />
      <path
        d="M93 88h46l-6 58H99z"
        fill="#FFFFFF"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path d="M97 114h38l-3 30h-32z" fill="#5B3A21" />
      <path
        d="M139 98h7a9 9 0 0 1 9 9v10a9 9 0 0 1-9 9h-9"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
      />
    </>
  ),
  "espresso-machine": (
    <>
      <ellipse cx="100" cy="180" rx="66" ry="6" fill="#0F1111" opacity="0.140" />
      <rect x="36" y="40" width="128" height="62" rx="12" fill="currentColor" />
      <rect x="36" y="90" width="26" height="80" fill="currentColor" />
      <rect x="36" y="162" width="128" height="16" rx="6" fill="currentColor" />
      <rect x="62" y="158" width="96" height="4" fill="#0F1111" opacity="0.250" />
      <circle cx="64" cy="70" r="12" fill="#FFFFFF" opacity="0.280" />
      <circle cx="64" cy="70" r="4" fill="#FF9900" />
      <rect x="92" y="58" width="60" height="6" rx="3" fill="#FFFFFF" opacity="0.300" />
      <rect x="92" y="72" width="36" height="6" rx="3" fill="#FFFFFF" opacity="0.180" />
      <rect x="88" y="102" width="34" height="12" rx="3" fill="#0F1111" opacity="0.450" />
      <rect x="116" y="104" width="40" height="8" rx="4" fill="#3A2A20" />
      <path
        d="M92 132h26l-3 26H95z"
        fill="#FFFFFF"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M148 102v30" stroke="#8A9199" strokeWidth="5" strokeLinecap="round" />
    </>
  ),
  "pour-over-set": (
    <>
      <ellipse cx="100" cy="180" rx="46" ry="6" fill="#0F1111" opacity="0.140" />
      <path d="M66 40h68l-20 44H86z" fill="currentColor" />
      <path d="M72 48h56" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.300" />
      <rect x="84" y="84" width="32" height="8" rx="3" fill="#0F1111" opacity="0.300" />
      <path
        d="M84 92h32l16 70a12 12 0 0 1-12 16H80a12 12 0 0 1-12-16z"
        fill="#FFFFFF"
        stroke="#9AA3AB"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path d="M76 134h48l6 28a8 8 0 0 1-8 12H78a8 8 0 0 1-8-12z" fill="#5B3A21" />
      <rect x="80" y="112" width="40" height="12" rx="4" fill="#A9773F" />
    </>
  ),
  "single-serve-coffee-maker": (
    <>
      <ellipse cx="100" cy="180" rx="50" ry="6" fill="#0F1111" opacity="0.140" />
      <rect x="56" y="34" width="88" height="70" rx="20" fill="currentColor" />
      <rect x="56" y="90" width="28" height="80" fill="currentColor" />
      <rect x="56" y="160" width="92" height="18" rx="8" fill="currentColor" />
      <rect x="96" y="104" width="24" height="10" fill="#0F1111" opacity="0.400" />
      <rect x="68" y="46" width="40" height="5" rx="2.500" fill="#FFFFFF" opacity="0.300" />
      <circle cx="124" cy="62" r="8" fill="#FFFFFF" opacity="0.300" />
      <circle cx="124" cy="62" r="3" fill="#FF9900" />
      <rect
        x="94"
        y="126"
        width="30"
        height="32"
        rx="6"
        fill="#FFFFFF"
        stroke="#9AA3AB"
        strokeWidth="3"
      />
      <path
        d="M124 134h4a6 6 0 0 1 6 6v4a6 6 0 0 1-6 6h-4"
        fill="none"
        stroke="#9AA3AB"
        strokeWidth="3"
      />
    </>
  ),
  "bean-to-cup-machine": (
    <>
      <ellipse cx="100" cy="180" rx="66" ry="6" fill="#0F1111" opacity="0.140" />
      <rect x="36" y="40" width="128" height="62" rx="12" fill="currentColor" />
      <rect x="36" y="90" width="26" height="80" fill="currentColor" />
      <rect x="36" y="162" width="128" height="16" rx="6" fill="currentColor" />
      <rect x="62" y="158" width="96" height="4" fill="#0F1111" opacity="0.250" />
      <circle cx="64" cy="70" r="12" fill="#FFFFFF" opacity="0.280" />
      <circle cx="64" cy="70" r="4" fill="#FF9900" />
      <rect x="92" y="58" width="60" height="6" rx="3" fill="#FFFFFF" opacity="0.300" />
      <rect x="92" y="72" width="36" height="6" rx="3" fill="#FFFFFF" opacity="0.180" />
      <rect x="88" y="102" width="34" height="12" rx="3" fill="#0F1111" opacity="0.450" />
      <rect x="116" y="104" width="40" height="8" rx="4" fill="#3A2A20" />
      <path
        d="M92 132h26l-3 26H95z"
        fill="#FFFFFF"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M148 102v30" stroke="#8A9199" strokeWidth="5" strokeLinecap="round" />
      <path
        d="M72 40l8-22h40l8 22z"
        fill="#FFFFFF"
        opacity="0.850"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path d="M80 40l5-10h30l5 10z" fill="#5B3A21" />
    </>
  ),
};
