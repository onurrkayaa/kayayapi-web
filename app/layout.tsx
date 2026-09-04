import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Geist, Geist_Mono } from "next/font/google";
import { gaMeasurementId } from "./data/site";
import { LanguageProvider } from "./i18n/LanguageContext";
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
  metadataBase: new URL("https://kayayapimimarlik.com"),
  applicationName: "Kaya Yapı Mimarlık",
  title: "Kaya Yapı — İnşaat, Mimari ve Taahhüt",
  description:
    "Konut ve iş binaları, müstakil ev ve peyzaj uygulamaları ile anahtar teslim taahhüt. İstanbul, Tekirdağ, Antalya, Muğla ve Adıyaman'da aktif.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Kaya Yapı Mimarlık",
    alternateName: ["Kaya Yapı", "Kaya Yapı & Mimarlık"],
    url: "https://kayayapimimarlik.com",
  };

  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
      <GoogleAnalytics gaId={gaMeasurementId} />
    </html>
  );
} 