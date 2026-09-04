import type { Metadata } from "next";
import { AboutSection } from "../../components/AboutSection";
import { CtaBanner } from "../../components/CtaBanner";
import { PageHero } from "../../components/PageHero";

export const metadata: Metadata = {
  title: "Hakkımızda — Kaya Yapı",
  description:
    "Kaya Yapı; konut, iş binası, müstakil ev ve peyzaj işlerini tek çatı altında yürüten bir inşaat ve mimarlık firmasıdır.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero page="about" />
      <AboutSection />
      <CtaBanner />
    </>
  );
}
