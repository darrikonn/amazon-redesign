"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { OrderLineView } from "@/use-case";
import { useBrowsing } from "./browsing-context";
import { typeset } from "./format";
import { isPlainClick } from "./plain-click";
import { withProduct } from "./search-url";

type OrderLineNameProps = {
  line: OrderLineView;
  className: string | undefined;
};

// Opens the product over the page, as cart lines do; a product that has left the
// catalogue has nothing to open, so its name is plain text.
export function OrderLineName({ line, className }: OrderLineNameProps) {
  const { openProduct } = useBrowsing();
  const pathname = usePathname();
  const { rating } = line;
  if (rating === null) return <span className={className}>{typeset(line.name)}</span>;
  return (
    <Link
      href={withProduct(pathname, line.productId)}
      prefetch={false}
      className={className}
      onClick={(event) => {
        if (!isPlainClick(event)) return;
        event.preventDefault();
        openProduct({ ...line, id: line.productId, rating });
      }}
    >
      {typeset(line.name)}
    </Link>
  );
}
