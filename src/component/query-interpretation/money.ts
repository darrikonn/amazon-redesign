const CENTS_PER_DOLLAR = 100;

export function parseAmountInCents(amount: string | undefined): number {
  const text = (amount ?? "0").trim();
  const dollars = /^\d/.test(text) ? Number(text) : wordsToNumber(text);
  return Math.round(dollars * CENTS_PER_DOLLAR);
}

export function formatDollars(cents: number): string {
  const dollars = cents / CENTS_PER_DOLLAR;
  return Number.isInteger(dollars) ? `$${dollars}` : `$${dollars.toFixed(2)}`;
}

const HUNDRED = 100;

const NUMBER_WORDS: ReadonlyMap<string, number> = new Map([
  ["a", 1],
  ["one", 1],
  ["two", 2],
  ["three", 3],
  ["four", 4],
  ["five", 5],
  ["six", 6],
  ["seven", 7],
  ["eight", 8],
  ["nine", 9],
  ["ten", 10],
  ["eleven", 11],
  ["twelve", 12],
  ["thirteen", 13],
  ["fourteen", 14],
  ["fifteen", 15],
  ["sixteen", 16],
  ["seventeen", 17],
  ["eighteen", 18],
  ["nineteen", 19],
  ["twenty", 20],
  ["thirty", 30],
  ["forty", 40],
  ["fifty", 50],
  ["sixty", 60],
  ["seventy", 70],
  ["eighty", 80],
  ["ninety", 90],
]);

function wordsToNumber(text: string): number {
  return text.split(/[\s-]+/).reduce(addNumberWord, 0);
}

function addNumberWord(total: number, word: string): number {
  if (word === "hundred") return Math.max(total, 1) * HUNDRED;
  return total + (NUMBER_WORDS.get(word) ?? 0);
}
