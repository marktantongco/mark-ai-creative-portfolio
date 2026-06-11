import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mark Anthony Tantongco | AI Creative Technologist | powerUP",
  description: "Mark Anthony Tantongco. AI Creative Technologist. Prompt Engineering. Digital Brand Systems. Building faith-driven, intelligent experiences. Taguig, Philippines.",
  keywords: ["AI Creative Technologist", "Prompt Engineering", "Brand Systems", "Faith-Driven Code", "powerUP", "Next.js", "GSAP", "ComfyUI", "React", "Red Portfolio"],
  authors: [{ name: "Mark Anthony Tantongco" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Mark Anthony Tantongco — AI Creative Technologist",
    description: "Building living digital organisms at the intersection of prompt engineering, visual design, and faith-driven code.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mark Anthony Tantongco — AI Creative Technologist",
    description: "Building living digital organisms at the intersection of prompt engineering, visual design, and faith-driven code.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
