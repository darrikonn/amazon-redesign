import type { Metadata, Viewport } from "next";
import { Source_Sans_3 } from "next/font/google";
import { cookies } from "next/headers";
import type { ReactNode } from "react";
import { createContainer } from "@/composition";
import { ShopShell } from "./_ui/shop-shell";
import "./global.css";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: { default: "Amazon: just say what you need", template: "%s | Amazon" },
  description: "Describe what you need and the filters set themselves while you type.",
};

export const viewport: Viewport = {
  themeColor: "#131921",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const container = createContainer(await cookies());
  const [session, storefront] = await Promise.all([
    container.viewSession.execute(),
    container.viewStorefront.execute(),
  ]);
  return (
    <html lang="en" className={sourceSans.variable}>
      <body>
        <ShopShell initialShopper={session.shopper} departments={storefront.departments}>
          {children}
        </ShopShell>
      </body>
    </html>
  );
}
