import type { Metadata } from "next";
import { HelpView } from "../_ui/help-view";

export const metadata: Metadata = { title: "Help" };

export default function HelpPage() {
  return <HelpView />;
}
