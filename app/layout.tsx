import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "../components/theme-provider"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Mindmap Maker - AI-Powered Mind Mapping Tool",
  description:
    "Create beautiful, organized mindmaps instantly with our AI-powered tool. Visualize concepts, brainstorm ideas, and export your mindmaps in multiple formats.",
  keywords: ["mindmap", "mind mapping", "AI", "visualization", "brainstorming", "organization", "ideas"],
  authors: [{ name: "Mindmap Maker Team" }],
  metadataBase: new URL("https://mind-map-maker.com"),
  openGraph: {
    title: "Mindmap Maker - AI-Powered Mind Mapping Tool",
    description: "Create beautiful, organized mindmaps instantly with our AI-powered tool.",
    url: "https://mind-map-maker.com",
    siteName: "Mind Map Maker",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mindmap Maker - AI-Powered Mind Mapping Tool",
    description: "Create beautiful, organized mindmaps instantly with our AI-powered tool.",
  },
  alternates: {
    canonical: "https://mind-map-maker.com",
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
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
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
