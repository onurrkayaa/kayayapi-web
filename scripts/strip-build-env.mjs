/**
 * OpenNext'in urettigi next-env.mjs dosyasindan uretim disi bloklari siler.
 *
 * Adaptor derleme aninda tum .env dosyalarini okuyup "production",
 * "development" ve "test" bloklarini bu dosyaya yaziyor; dosya da dagitilan
 * Worker'in icine giriyor. Gelistirme blogu yerel gizli degerleri tasidigi
 * icin, Worker'a hicbir gizli deger girmesin diye dagitimdan once temizlenir.
 * Uretimde bu degerler zaten "wrangler secret put" ile geliyor.
 */

import { readFileSync, writeFileSync } from "node:fs";

const file = ".open-next/cloudflare/next-env.mjs";
const source = readFileSync(file, "utf8");

const production = source.match(/^export const production = .*$/m);
if (!production) {
  console.error(`${file}: production blogu bulunamadi, derleme cikti bicimi degismis olabilir.`);
  process.exit(1);
}

writeFileSync(
  file,
  `${production[0]}\nexport const development = {};\nexport const test = {};\n`
);
console.log(`${file}: gelistirme ve test bloklari temizlendi.`);
