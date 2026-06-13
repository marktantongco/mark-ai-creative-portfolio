import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const isStaticExport = process.env.NEXT_STATIC_EXPORT === "true";
const basePath = isStaticExport ? "/mark-ai-creative-portfolio" : "";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MARK.TECH — AI Creative Technologist Portfolio | Mark Anthony Tantongco | powerUP",
  description:
    "Mark Anthony Tantongco is an AI Creative Technologist based in Quezon City, Philippines. Specializing in Prompt Engineering, Brand Systems, Production Code (React/Next.js/GSAP/Three.js), ComfyUI Pipelines, GEO & SEO Strategy, and Insurance Tech. Building living digital organisms at the intersection of strategy, design, and code.",
  keywords: [
    "AI Creative Technologist",
    "Prompt Engineering",
    "Brand Systems",
    "Design Tokens",
    "Production Code",
    "React",
    "Next.js",
    "GSAP",
    "Three.js",
    "ComfyUI",
    "GEO Strategy",
    "Generative Engine Optimization",
    "SEO Architecture",
    "JSON-LD",
    "Schema.org",
    "WebGL",
    "Framer Motion",
    "Faith-Driven Code",
    "powerUP",
    "Mark Anthony Tantongco",
    "Quezon City",
    "Philippines",
    "Insurance Technology",
    "Pacific Cross",
    "AI Portfolio",
    "Claude API",
  ],
  authors: [{ name: "Mark Anthony Tantongco", url: "https://github.com/marktantongco" }],
  creator: "Mark Anthony Tantongco",
  publisher: "powerUP",
  metadataBase: new URL("https://my-project-one-lime-24.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "MARK.TECH — AI Creative Technologist | Mark Anthony Tantongco",
    description:
      "Six core capabilities at the intersection of strategy, design, and code. Prompt Engineering. Brand Systems. Production Code. ComfyUI Pipelines. GEO Strategy. Insurance Tech.",
    type: "website",
    locale: "en_US",
    url: "https://my-project-one-lime-24.vercel.app",
    siteName: "MARK.TECH",
  },
  twitter: {
    card: "summary_large_image",
    title: "MARK.TECH — AI Creative Technologist | Mark Anthony Tantongco",
    description:
      "Six core capabilities at the intersection of strategy, design, and code. Prompt Engineering. Brand Systems. Production Code. ComfyUI Pipelines. GEO Strategy.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="icon" href={`${basePath}/logo.svg`} sizes="any" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
