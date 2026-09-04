import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CtaBanner } from "../../../components/CtaBanner";
import { PageHero } from "../../../components/PageHero";
import { ProjectDetail } from "../../../components/ProjectDetail";
import { projectIds, type ProjectId } from "../../../data/site";
import { dictionary } from "../../../i18n/dictionary";

export function generateStaticParams() {
  return projectIds.map((slug) => ({ slug }));
}

export async function generateMetadata(
  props: PageProps<"/projeler/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const copy = dictionary.tr.projects.items[slug as ProjectId];
  if (!copy) return {};
  return { title: `${copy.name} — Kaya Yapı`, description: copy.intro };
}

export default async function ProjectPage(props: PageProps<"/projeler/[slug]">) {
  const { slug } = await props.params;
  if (!projectIds.includes(slug as ProjectId)) notFound();
  const id = slug as ProjectId;

  return (
    <>
      <PageHero page="project" projectId={id} />
      <ProjectDetail id={id} />
      <CtaBanner />
    </>
  );
}
