/**
 * OpenNext'in Cloudflare Workers uyarlamasi.
 *
 * Site sayfalari derleme aninda uretiliyor ve tek dinamik yol /api/chat
 * onbelleklenemez oldugu icin artimli onbellek (R2) kurulmuyor; varsayilan
 * yapilandirma yeterli.
 */
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig();
