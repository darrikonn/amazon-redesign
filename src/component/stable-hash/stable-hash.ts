const OFFSET_BASIS = 0x811c9dc5;
const PRIME = 0x01000193;

// FNV-1a: the same text always gives the same unsigned 32-bit number, on every machine,
// so choices made from it (today's deals, sample orders) are repeatable.
export function stableHash(text: string): number {
  let hash = OFFSET_BASIS;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, PRIME);
  }
  return hash >>> 0;
}
