import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { SmoothScroll } from "./components/SmoothScroll";
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
  title: "Kaya Yapı — İnşaat, Mimari ve Taahhüt",
  description:
    "Konut ve iş binaları, müstakil ev ve peyzaj uygulamaları ile anahtar teslim taahhüt. İstanbul, Tekirdağ, Antalya, Muğla ve Adıyaman'da aktif.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LanguageProvider>
          <SmoothScroll />
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </LanguageProvider>
      </body>
      <GoogleAnalytics gaId={gaMeasurementId} />
    </html>
  );
}
