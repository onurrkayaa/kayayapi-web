import type { Metadata } from "next";
import { CtaBanner } from "../../components/CtaBanner";
import { DesignSteps } from "../../components/DesignSteps";
import { PageHero } from "../../components/PageHero";

export const metadata: Metadata = {
  title: "Tasarım ve İnovasyon — Kaya Yapı",
  description:
    "Tasarım, analiz, danışmanlık ve uygulama: her projeyi aynı dört adımdan geçiriyoruz.",
};

export default function DesignPage() {
  return (
    <>
      <PageHero page="design" />
      <DesignSteps />
      <CtaBanner />
    </>
  );
}
