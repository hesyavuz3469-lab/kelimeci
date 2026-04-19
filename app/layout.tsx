import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kelimeci – Günlük Türkçe Kelime Oyunu",
  description:
    "Her gün farklı kategoride Türkçe kelime bul. Arkadaşlarınla yarış, liderboard'a çık!",
  keywords: ["kelime oyunu", "türkçe wordle", "günlük bulmaca", "kelimeci"],
  openGraph: {
    title: "Kelimeci – Günlük Türkçe Kelime Oyunu",
    description: "Her gün farklı kategoride Türkçe kelime bul!",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Google AdSense — ca-pub ID'nizi buraya girin */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
      </head>
      <body className="min-h-full flex flex-col bg-zinc-950">{children}</body>
    </html>
  );
}
