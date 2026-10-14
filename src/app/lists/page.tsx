import type { Metadata } from "next";
import { requireShopper } from "../_ui/require-shopper";
import { SavedListView } from "../_ui/saved-list-view";

export const metadata: Metadata = { title: "Your list" };

export default async function ListsPage() {
  await requireShopper("/lists");
  return <SavedListView />;
}
