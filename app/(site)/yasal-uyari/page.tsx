import type { Metadata } from "next";
import { LegalDocument } from "../../components/LegalDocument";
import { PageHero } from "../../components/PageHero";

export const metadata: Metadata = {
  title: "Yasal Uyarı — Kaya Yapı",
  description:
    "Kaya Yapı internet sitesinin kullanım koşulları, fikri mülkiyet hakları ve sorumluluk sınırları.",
};

export default function LegalNoticePage() {
  return (
    <>
      <PageHero page="legal" legalKey="notice" />
      <LegalDocument doc="notice" />
    </>
  );
}
