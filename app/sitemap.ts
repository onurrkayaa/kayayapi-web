import type { MetadataRoute } from "next";
import { projectIds, siteUrl } from "./data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/hakkimizda",
    "/projeler",
    "/tasarim-ve-inovasyon",
    "/iletisim",
    "/yasal-uyari",
    "/gizlilik-politikasi",
    "/kvkk",
    ...projectIds.map((id) => `/projeler/${id}`),
  ];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "monthly" : "yearly",
    priority: route === "" ? 1 : 0.7,
  }));
}
