import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SEO Text Analyzer - Optimize Your Content",
  description:
    "Analyze your blog posts, newsletters, and social media content for SEO optimization. Get keyword suggestions and readability scores powered by TextRazor.",
  keywords: [
    "SEO",
    "content analysis",
    "keyword research",
    "readability",
    "TextRazor",
  ],
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
