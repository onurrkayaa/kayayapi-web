import type { Metadata } from "next";
import { ContactSection } from "../components/ContactSection";
import { PageHero } from "../components/PageHero";

export const metadata: Metadata = {
  title: "İletişim — Kaya Yapı",
  description:
    "Kaya Yapı iletişim bilgileri ve proje talep formu. Merkez ofis Ataşehir, İstanbul'da çok yakında açılıyor.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero page="contact" />
      <ContactSection />
    </>
  );
}
