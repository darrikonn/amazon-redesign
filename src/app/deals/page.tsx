import { DealsView } from "../_ui/deals-view";
import { titledPage } from "../_ui/page-metadata";

export const generateMetadata = titledPage("Today’s deals");

export default function DealsPage() {
  return <DealsView />;
}
