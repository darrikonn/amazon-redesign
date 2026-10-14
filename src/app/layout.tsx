import type { Metadata, Viewport } from "next";
import { Source_Sans_3 } from "next/font/google";
import type { ReactNode } from "react";
import "./global.css";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Amazon: just say what you need",
  description: "Describe what you need and the filters set themselves while you type.",
};

export const viewport: Viewport = {
  themeColor: "#131921",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={sourceSans.variable}>
      <body>{children}</body>
    </html>
  );
}
