import type { OrderLineView, OrderView } from "@/use-case";
import { formatOrderDate } from "./format";

export function returnStatus(line: OrderLineView, stage: OrderView["stage"]): string {
  if (line.isReturned) return "Return started";
  if (line.returnableUntil === null) return "Not returnable";
  if (stage !== "delivered") return "Returnable once delivered";
  if (line.isReturnable) return `Return or replace by ${formatOrderDate(line.returnableUntil)}`;
  return "Return window closed";
}
