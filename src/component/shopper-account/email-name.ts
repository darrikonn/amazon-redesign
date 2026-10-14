import { capitalize } from "../catalog-vocabulary";

export type ShopperName = {
  firstName: string;
  fullName: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normaliseEmail(text: string): string | null {
  const email = text.trim().toLowerCase();
  return EMAIL_PATTERN.test(email) ? email : null;
}

// The part before the @, without a +tag, split into words on dots, underscores, and
// hyphens, with digits dropped (ADR 0030).
export function nameFromEmail(email: string): ShopperName {
  const localPart = email.split("@")[0] ?? "";
  const withoutTag = localPart.split("+")[0] ?? "";
  const words = withoutTag
    .split(/[._-]+/)
    .map((word) => word.replaceAll(/\d+/g, ""))
    .filter((word) => word !== "")
    .map(capitalize);
  const [firstName] = words;
  if (firstName === undefined) return { firstName: FALLBACK_NAME, fullName: FALLBACK_NAME };
  return { firstName, fullName: words.join(" ") };
}

const FALLBACK_NAME = "Shopper";
