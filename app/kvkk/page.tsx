import type { Metadata } from "next";
import { LegalDocument } from "../components/LegalDocument";
import { PageHero } from "../components/PageHero";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni — Kaya Yapı",
  description:
    "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında Kaya Yapı aydınlatma metni ve başvuru yolları.",
};

export default function KvkkPage() {
  return (
    <>
      <PageHero page="legal" legalKey="kvkk" />
      <LegalDocument doc="kvkk" />
    </>
  );
}
