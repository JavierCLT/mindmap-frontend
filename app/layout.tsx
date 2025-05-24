import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { MobileNav } from "@/components/mobile-nav"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Mind Map Maker - Create Interactive Mind Maps",
  description:
    "Create beautiful, interactive mind maps for learning, brainstorming, and organizing ideas. Free online mind mapping tool.",
  keywords: "mind map, mindmap, brainstorming, learning, organization, visual thinking",
  authors: [{ name: "Mind Map Maker" }],
  creator: "Mind Map Maker",
  publisher: "Mind Map Maker",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://www.mind-map-maker.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Mind Map Maker - Create Interactive Mind Maps",
    description:
      "Create beautiful, interactive mind maps for learning, brainstorming, and organizing ideas. Free online mind mapping tool.",
    url: "https://www.mind-map-maker.com",
    siteName: "Mind Map Maker",
    images: [
      {
        url: "/favicon.png",
        width: 64,
        height: 64,
        alt: "Mind Map Maker",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Mind Map Maker - Create Interactive Mind Maps",
    description:
      "Create beautiful, interactive mind maps for learning, brainstorming, and organizing ideas. Free online mind mapping tool.",
    images: ["/favicon.png"],
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
  verification: {
    google: "your-google-verification-code",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.png" sizes="64x64" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="min-h-screen bg-background text-foreground">
            <MobileNav />
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
