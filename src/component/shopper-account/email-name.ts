import { capitalize } from "../text";

export type ShopperName = {
  firstName: string;
  fullName: string;
};

export const EMAIL_RULES = {
  // The longest address mail servers accept (RFC 5321); a longer one would also overflow
  // the session cookie, which the browser then silently drops.
  maximumLength: 254,
} as const;

// Letters, digits, and the punctuation addresses really use, an @, and a dotted domain.
const EMAIL_PATTERN = /^[a-z0-9._%+'-]+@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/;

export function normaliseEmail(text: string): string | null {
  const email = text.trim().toLowerCase();
  if (email.length > EMAIL_RULES.maximumLength) return null;
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
