import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "../components/theme-provider"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Mind Map Maker - AI-Powered Mind Mapping Tool",
  description:
    "Create beautiful, organized mind maps instantly with our AI-powered tool. Visualize concepts, brainstorm ideas, and export your mind maps in multiple formats.",
  keywords: ["mind map", "mind mapping", "AI", "visualization", "brainstorming", "organization", "ideas"],
  authors: [{ name: "Mind Map Maker Team" }],
  metadataBase: new URL("https://mind-map-maker.com"),
  openGraph: {
    title: "Mind Map Maker - AI-Powered Mind Mapping Tool",
    description: "Create beautiful, organized mind maps instantly with our AI-powered tool.",
    url: "https://mind-map-maker.com",
    siteName: "Mind Map Maker",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mind Map Maker - AI-Powered Mind Mapping Tool",
    description: "Create beautiful, organized mind maps instantly with our AI-powered tool.",
  },
  alternates: {
    canonical: "https://mind-map-maker.com",
  },
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
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
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
        {/* Plausible Analytics */}
        <Script
          defer
          data-domain="mind-map-maker.com"
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
