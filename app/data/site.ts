/**
 * Metin disi sabitler: gorsel adresleri, proje kimlikleri ve harita geometrisi.
 * Tum metinler app/i18n/dictionary.ts icinde tutulur.
 */

/** Site adresi ve iletisim adresi tek yerde tutulur. */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://kayayapimimarlik.com";
export const contactEmail = "info@kayayapimimarlik.com";

/** Google Analytics 4 olcum kimligi; gizli degildir, tarayiciya iner. */
export const gaMeasurementId = "G-F4WX6QBKGF";

/** Unsplash kaynak genisligi: buyuk sahneler icin genis, kucuk kartlar icin dar. */
const photo = (id: string, width: 1200 | 1600 | 2400 = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=80`;

export const heroImage = photo("1607963546003-e59b11fe7f23", 2400);

/** Ana sayfadaki surekli akan serit — konum bilgisi tasimaz, tasarim gorselleridir. */
export const stripImages = [
  photo("1613152161890-52aa17add7c9", 1200),
  photo("1676679879918-700f13372796", 1200),
  photo("1579632652768-6cb9dcf85912", 1200),
  photo("1718235988649-c911c6de9eaf", 1200),
  photo("1527169809256-51bcc03eef15", 1200),
  photo("1593054538306-3e61b738a10c", 1200),
  photo("1626273947634-823f04de159e", 1200),
  photo("1761637823293-f96835ec5038", 1200),
];

export const serviceImages = [
  photo("1579632652768-6cb9dcf85912", 1200),
  photo("1676679879918-700f13372796", 1200),
  photo("1613152161890-52aa17add7c9", 1200),
  photo("1718235988649-c911c6de9eaf", 1200),
  photo("1508450859948-4e04fabaa4ea", 1200),
];

export const ctaImage = photo("1599995903128-531fc7fb694b", 2400);

/** Ic sayfa basliklarinin arka plan gorselleri. */
export const pageHeroImages = {
  about: photo("1546414701-81cc6963c67f", 2400),
  projects: photo("1591076787947-aaa4dec435d8", 2400),
  design: photo("1616418534243-ab757ff8ce3a", 2400),
  contact: photo("1621831337128-35676ca30868", 2400),
  legal: photo("1546414701-81cc6963c67f", 2400),
};

/** Tasarim ve inovasyon sayfasindaki dort adimin gorselleri. */
export const designStepImages = [
  photo("1721244654394-36a7bc2da288", 1200),
  photo("1721244653652-268631ec049a", 1200),
  photo("1534138807944-7b5dd2954e1a", 1200),
  photo("1531834685032-c34bf0d84c77", 1200),
];

export type ProjectId = "ofis" | "konut" | "mustakil" | "peyzaj";

export type ProjectMeta = {
  id: ProjectId;
  /** Kart ve detay sayfasinin kapak gorseli. */
  cover: string;
  /** Detay sayfasindaki galeri; sira dictionary'deki `views` etiketleriyle eslesir. */
  gallery: string[];
};

export const projects: ProjectMeta[] = [
  {
    id: "ofis",
    cover: photo("1676679879918-700f13372796"),
    gallery: [
      photo("1676679879918-700f13372796"),
      photo("1549757521-4160565ff3de"),
      photo("1593054538306-3e61b738a10c"),
      photo("1707823942892-3316eeb091a0"),
    ],
  },
  {
    id: "konut",
    cover: photo("1579632652768-6cb9dcf85912"),
    gallery: [
      photo("1579632652768-6cb9dcf85912"),
      photo("1626273947634-823f04de159e"),
      photo("1432297984334-707d34c4163a"),
      photo("1678388583153-f0e667c97288"),
    ],
  },
  {
    id: "mustakil",
    cover: photo("1613152161890-52aa17add7c9"),
    gallery: [
      photo("1613152161890-52aa17add7c9"),
      photo("1527169809256-51bcc03eef15"),
      photo("1721134118712-105003f8c66e"),
      photo("1722421492323-eaf9c401befe"),
    ],
  },
  {
    id: "peyzaj",
    cover: photo("1718235988649-c911c6de9eaf"),
    gallery: [
      photo("1718235988649-c911c6de9eaf"),
      photo("1761637823293-f96835ec5038"),
      photo("1717403838266-714eeab68af6"),
      photo("1707655536176-a2bc5e00cba9"),
    ],
  },
];

export const projectIds = projects.map((project) => project.id);

/** Haritada kiremit kirmizisiyla dolan iller. */
export const activeProvinceIds = [
  "istanbul",
  "tekirdag",
  "antalya",
  "mugla",
  "adiyaman",
] as const;

export type ActiveProvinceId = (typeof activeProvinceIds)[number];

/**
 * Harita etiketleri: govdeden yukari cikan okun ucu ve yazinin hizasi.
 * Degerler turkeyProvinces.ts ile ayni kullanici birimindedir.
 */
export const provinceLabels: Record<
  ActiveProvinceId,
  { toY: number; anchor: "start" | "middle" | "end"; labelX?: number }
> = {
  tekirdag: { toY: -18, anchor: "end", labelX: 100 },
  istanbul: { toY: 14, anchor: "middle" },
  mugla: { toY: 288, anchor: "middle" },
  antalya: { toY: 302, anchor: "middle" },
  adiyaman: { toY: 232, anchor: "middle" },
};

/** Haritanin ust tarafinda etiketlere yer birakan gorunum kutusu. */
export const mapViewBox = "-10 -46 1020 480";

export type OfficeState = "open" | "soon" | "planned";

/** Ofis listesi; metinler sozlukteki map.offices altinda tutulur. */
export const offices: { id: ActiveProvinceId; state: OfficeState }[] = [
  { id: "istanbul", state: "soon" },
  { id: "adiyaman", state: "open" },
  { id: "tekirdag", state: "planned" },
  { id: "mugla", state: "planned" },
  { id: "antalya", state: "planned" },
];

/** Il adlari ozel isimdir, dile gore degismez. */
export const cityLabels: Record<ActiveProvinceId, string> = {
  istanbul: "İstanbul",
  tekirdag: "Tekirdağ",
  antalya: "Antalya",
  mugla: "Muğla",
  adiyaman: "Adıyaman",
};
