import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Hoffmann — Engineer",
  description: "Forward-deployed engineer. I build systems end-to-end — firmware to web platform, hardware to cloud.",
  metadataBase: new URL("https://hoffswitch.com"),
  openGraph: {
    title: "Hoffmann — Engineer",
    description: "Forward-deployed engineer. I build systems end-to-end.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${mono.variable} h-full`}>
      <body className="scanlines min-h-full flex flex-col">{children}</body>
    </html>
  );
}
