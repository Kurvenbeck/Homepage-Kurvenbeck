import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "800"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dmsans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kurvenbeck.de"),
  title: {
    default: "Kurvenbeck — Biergarten · Catering · Backstube",
    template: "%s — Kurvenbeck",
  },
  description:
    "Familienbetrieb seit 1978: Biergarten, Catering und Backstube. Drei Handwerke, ein Name — ehrliches schwäbisches Handwerk.",
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "Kurvenbeck",
    title: "Kurvenbeck — Biergarten · Catering · Backstube",
    description:
      "Familienbetrieb seit 1978: Biergarten, Catering und Backstube. Drei Handwerke, ein Name.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className={`${playfair.variable} ${dmSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
