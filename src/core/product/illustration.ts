export type IllustrationShape =
  | "led-desk-lamp"
  | "swing-arm-lamp"
  | "gooseneck-lamp"
  | "monitor-light-bar"
  | "bankers-lamp"
  | "charging-base-lamp"
  | "tripod-lamp"
  | "over-ear-headphones"
  | "earbuds-with-case"
  | "sport-earbuds"
  | "studio-headphones"
  | "folding-headphones"
  | "laptop-backpack"
  | "roll-top-backpack"
  | "daypack"
  | "travel-backpack"
  | "drip-coffee-maker"
  | "espresso-machine"
  | "pour-over-set"
  | "single-serve-coffee-maker"
  | "bean-to-cup-machine";

export type Illustration = {
  shape: IllustrationShape;
  isMirrored: boolean;
};
