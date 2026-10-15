import type { OrderLineView } from "@/use-case";
import { formatOrderDate } from "./format";

export function returnStatus(line: OrderLineView): string {
  switch (line.returnState) {
    case "returned":
      return "Return started";
    case "never-returnable":
      return "Not returnable";
    case "returnable-once-delivered":
      return "Returnable once delivered";
    case "returnable":
      return line.returnableUntil === null
        ? "Returnable"
        : `Return by ${formatOrderDate(line.returnableUntil)}`;
    case "window-closed":
      return "Return window closed";
  }
}
