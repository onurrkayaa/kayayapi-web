import type { Metadata } from "next";
import { CtaBanner } from "../../components/CtaBanner";
import { PageHero } from "../../components/PageHero";
import { ProjectsGrid } from "../../components/ProjectsGrid";

export const metadata: Metadata = {
  title: "Projeler — Kaya Yapı",
  description:
    "İş merkezi, konut bloğu, müstakil ev ve peyzaj düzenlemesi: tasarım arşivimizden dört çalışma.",
};

export default function ProjectsPage() {
  return (
    <>
      <PageHero page="projects" />
      <ProjectsGrid />
      <CtaBanner />
    </>
  );
}
