import type { CategoryId, Color, Feature } from "@/core";
import { NotFoundError } from "@/core";

export type CategoryVocabulary = {
  category: CategoryId;
  label: string;
  synonyms: readonly string[];
};

export type FeatureVocabulary = {
  feature: Feature;
  label: string;
  inSentence: string;
  phrase: string;
  synonyms: readonly string[];
};

export type ColorVocabulary = {
  color: Color;
  label: string;
  synonyms: readonly string[];
};

// Longer synonyms come first inside each list so "desk lamps" wins over "lamp".
// Features are read before categories, so "machine" and "maker" catch what is left of
// "espresso machine" or "filter coffee maker" once the feature has been taken.
export const CATEGORY_VOCABULARY: readonly CategoryVocabulary[] = [
  {
    category: "desk-lamp",
    label: "Desk lamps",
    synonyms: [
      "desk lamps",
      "desk lamp",
      "reading lamps",
      "reading lamp",
      "desk light",
      "lamps",
      "lamp",
      "light",
    ],
  },
  {
    category: "headphones",
    label: "Headphones",
    synonyms: ["headphones", "headphone", "earbuds", "earphones", "headset"],
  },
  {
    category: "backpack",
    label: "Backpacks",
    synonyms: ["backpacks", "backpack", "rucksack", "school bag", "daypack", "bag"],
  },
  {
    category: "coffee-maker",
    label: "Coffee makers",
    synonyms: [
      "coffee makers",
      "coffee maker",
      "coffee machine",
      "espresso machine",
      "coffee",
      "machine",
      "maker",
    ],
  },
];

// "wireless charging" precedes "wireless" so a charging base is not read as Bluetooth.
export const FEATURE_VOCABULARY: readonly FeatureVocabulary[] = [
  feature("wireless-charging", "Wireless charging", ["wireless charging", "charging base"]),
  feature("noise-cancelling", "Noise cancelling", [
    "noise cancelling",
    "noise canceling",
    "noise-cancelling",
    "noise-canceling",
    "anc",
  ]),
  feature("wireless", "Wireless", ["wireless", "bluetooth"]),
  feature("dimmable", "Dimmable", ["dimmable", "dimmer", "dimming"]),
  feature("rechargeable", "Rechargeable", ["rechargeable", "battery powered", "cordless"]),
  feature("clamp", "Clamp", ["clamp", "clip-on", "clip on"]),
  { ...feature("usb", "USB", ["usb"]), inSentence: "USB" },
  feature("foldable", "Foldable", ["foldable", "folding", "packable"]),
  feature("over-ear", "Over-ear", ["over-ear", "over ear"]),
  feature("in-ear", "In-ear", ["in-ear", "in ear"]),
  feature("waterproof", "Waterproof", [
    "waterproof",
    "water resistant",
    "water-resistant",
    "sweatproof",
    "rain",
  ]),
  feature("microphone", "Microphone", ["microphone", "mic", "for calls"]),
  feature("laptop", "Laptop", ["laptop"]),
  feature("travel", "Travel", ["travel", "carry-on", "carry on"]),
  feature("lightweight", "Lightweight", ["lightweight", "light weight"]),
  feature("school", "School", ["school", "kids"]),
  feature("espresso", "Espresso", ["espresso"]),
  feature("drip", "Drip", ["drip", "filter coffee"]),
  feature("grinder", "Grinder", ["grinder", "bean to cup", "bean-to-cup"]),
  feature("compact", "Compact", ["compact", "small"]),
  feature("programmable", "Programmable", ["programmable", "timer"]),
];

export const COLOR_VOCABULARY: readonly ColorVocabulary[] = [
  { color: "black", label: "Black", synonyms: ["black"] },
  { color: "white", label: "White", synonyms: ["white"] },
  { color: "blue", label: "Blue", synonyms: ["blue"] },
  { color: "green", label: "Green", synonyms: ["green"] },
  { color: "red", label: "Red", synonyms: ["red"] },
  { color: "grey", label: "Grey", synonyms: ["grey", "gray"] },
  { color: "brass", label: "Brass", synonyms: ["brass"] },
  { color: "wood", label: "Wood", synonyms: ["wooden", "wood"] },
  { color: "navy", label: "Navy", synonyms: ["navy"] },
];

export const STOP_WORDS: ReadonlySet<string> = new Set([
  "a",
  "an",
  "the",
  "with",
  "that",
  "and",
  "for",
  "in",
  "of",
  "is",
  "are",
  "me",
  "i",
  "need",
  "want",
  "looking",
  "find",
  "show",
  "some",
  "good",
  "nice",
  "to",
  "my",
  "which",
  "can",
  "it",
  "be",
  "on",
  "or",
  "please",
  "something",
  "under",
  "below",
  "over",
  "above",
  "between",
  "than",
  "less",
  "more",
  "arrives",
  "arrive",
  "arriving",
  "by",
  "stars",
  "star",
  "rated",
  "top",
  "best",
  "up",
  "max",
  "at",
  "least",
  "get",
  "here",
  "delivered",
  "delivery",
  "have",
  "has",
  "one",
  "ones",
  "new",
  "buy",
  "do",
  "you",
  "any",
]);

export function featureLabel(target: Feature): string {
  return demandFeatureVocabulary(target).label;
}

export function featureInSentence(target: Feature): string {
  return demandFeatureVocabulary(target).inSentence;
}

export function featurePhrase(target: Feature): string {
  return demandFeatureVocabulary(target).phrase;
}

export function colorLabel(target: Color): string {
  const entry = COLOR_VOCABULARY.find((candidate) => candidate.color === target);
  return entry === undefined ? target : entry.label;
}

function feature(target: Feature, label: string, synonyms: readonly string[]): FeatureVocabulary {
  const phrase = synonyms[0] ?? label.toLowerCase();
  return { feature: target, label, inSentence: phrase, phrase, synonyms };
}

function demandFeatureVocabulary(target: Feature): FeatureVocabulary {
  const entry = FEATURE_VOCABULARY.find((candidate) => candidate.feature === target);
  if (entry === undefined) throw new NotFoundError("feature vocabulary", target);
  return entry;
}
