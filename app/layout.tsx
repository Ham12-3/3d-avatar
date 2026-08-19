import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "@/components/providers";
import "./globals.css";

const body = Archivo({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const data = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-data", display: "swap" });
const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Nova · Operations workspace", template: "%s · Nova" },
  description: "Revenue, support, knowledge, and browser-based voice controls in one workspace.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const content = <Providers>{children}</Providers>;
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth" className={`${body.variable} ${data.variable} ${display.variable}`}>
      <body>{process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? <ClerkProvider>{content}</ClerkProvider> : content}</body>
    </html>
  );
}
