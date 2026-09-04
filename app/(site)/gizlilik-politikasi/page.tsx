import type { Metadata } from "next";
import { LegalDocument } from "../../components/LegalDocument";
import { PageHero } from "../../components/PageHero";

export const metadata: Metadata = {
  title: "Gizlilik Politikası — Kaya Yapı",
  description:
    "Kaya Yapı sitesinde hangi verilerin toplandığı, neden işlendiği ve ne kadar süreyle saklandığı.",
};

export default function PrivacyPage() {
  return (
    <>
      <PageHero page="legal" legalKey="privacy" />
      <LegalDocument doc="privacy" />
    </>
  );
}
