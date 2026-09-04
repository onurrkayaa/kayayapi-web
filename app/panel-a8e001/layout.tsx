import type { Metadata } from "next";

/** Panel arama motorlarina hicbir kosulda girmez. */
export const metadata: Metadata = {
  title: "Kaya Yapı — Ziyaretçi paneli",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: LayoutProps<"/panel-a8e001">) {
  return children;
}
