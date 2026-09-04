import { Analytics } from "../components/Analytics";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { SmoothScroll } from "../components/SmoothScroll";

/**
 * Sitenin kabugu: baslik, altlik, yumusak kaydirma ve cerezsiz olcum.
 *
 * Yonetim paneli bu grubun disinda durdugu icin ne bu kabugu tasir ne de
 * olculur; boylece panelin adresi site paketine hicbir yerde girmez.
 */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Analytics />
      <SmoothScroll />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
