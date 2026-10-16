import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Montserrat } from "next/font/google";
import { themeScript } from "@/lib/theme";
import "./globals.css";

const sans = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const display = Montserrat({ subsets: ["latin"], weight: ["500", "600", "700", "800"], variable: "--font-montserrat", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "SAPOK TECH — If you can think it, we can build it", template: "%s · SAPOK TECH" },
  description:
    "SAPOK TECH is a technology and consulting company that turns ideas into working technology — websites, apps, enterprise systems, payments and AI — designed, built and supported end to end.",
  keywords: ["SAPOK TECH", "tech company Nigeria", "software development", "tech consulting", "web development", "mobile apps", "Ogun State", "Redemption City"],
  openGraph: {
    title: "SAPOK TECH — If you can think it, we can build it",
    description: "An all-round technology solutions company. Bring us the idea — we bring it to life.",
    type: "website",
    images: ["/brand/sapok-tech-logo-dark.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#020c0a",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${display.variable} ${mono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
