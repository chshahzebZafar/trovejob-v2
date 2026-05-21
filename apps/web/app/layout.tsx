import type { Metadata } from "next";
import "@fontsource/cormorant-garamond/300.css";
import "@fontsource/cormorant-garamond/300-italic.css";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/dm-mono/300.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "TroveJob — Curated Job Board",
    template: "%s · TroveJob",
  },
  description:
    "A curated job board for people who care about their work. Zero friction apply — no forced accounts.",
  openGraph: {
    siteName: "TroveJob",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {children}
      </body>
    </html>
  );
}
