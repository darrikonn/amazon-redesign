import type { Metadata } from "next";
import { DealsView } from "../_ui/deals-view";

export const metadata: Metadata = { title: "Today’s deals" };

export default function DealsPage() {
  return <DealsView />;
}
