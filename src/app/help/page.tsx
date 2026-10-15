import { HelpView } from "../_ui/help-view";
import { titledPage } from "../_ui/page-metadata";

export const generateMetadata = titledPage("Help");

export default function HelpPage() {
  return <HelpView />;
}
