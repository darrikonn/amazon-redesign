type CountedLine = {
  quantity: number;
};

type PricedLine = CountedLine & {
  priceInCents: number;
};

// For cart lines and order lines alike.
export function itemCount(lines: readonly CountedLine[]): number {
  return lines.reduce((count, line) => count + line.quantity, 0);
}

export function lineTotalInCents(line: PricedLine): number {
  return line.priceInCents * line.quantity;
}

export function totalInCents(lines: readonly PricedLine[]): number {
  return lines.reduce((total, line) => total + lineTotalInCents(line), 0);
}
