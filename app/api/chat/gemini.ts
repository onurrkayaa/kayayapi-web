/**
 * Gemini REST cagrisi ve SSE ayristirma.
 *
 * SDK kullanilmaz: dogrudan fetch hem Node hem Cloudflare Workers calisma
 * zamaninda ayni sekilde calisir ve pakete ek agirlik binmez.
 */

import type { Locale } from "../../i18n/dictionary";
import type { ChatMessage } from "./guard";
import { buildSystemInstruction, wrapUserText } from "./knowledge";

const MODEL = "gemini-flash-latest";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:streamGenerateContent?alt=sse`;
/**
 * Yalnizca baglanti ve ilk yanit icin sure siniri. Akis basladiktan sonra
 * saat durdurulur: AbortSignal.timeout govde akarken de isledigi icin uzun
 * cevaplar cumlenin ortasinda kesiliyordu.
 */
const UPSTREAM_TIMEOUT_MS = 20_000;

/**
 * Maliyet tavani: tek bir cevabin uzunlugu ve sayisi sunucuda sabitlenir.
 *
 * thinkingBudget 0 sart: Gemini'nin dusunme token'lari maxOutputTokens
 * butcesinden dusuyor, acik birakilirsa cevap cumlenin ortasinda kesiliyor.
 * Kurumsal soru-cevap icin dusunme adimina zaten gerek yok; kapatmak ayni
 * zamanda cevabi hizlandiriyor ve ucuzlatiyor.
 */
const GENERATION_CONFIG = {
  temperature: 0.3,
  maxOutputTokens: 500,
  candidateCount: 1,
  thinkingConfig: { thinkingBudget: 0 },
} as const;

type GeminiChunk = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
};

/**
 * SSE satirlarini ayiklayip yalnizca duz metin parcalarini gecirir.
 * Ayristirilamayan satirlar sessizce atlanir; ham upstream verisi disari cikmaz.
 */
function sseToText(): TransformStream<Uint8Array, Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  return new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      buffer += decoder.decode(chunk, { stream: true });
      const lines = buffer.split("\n");
      // Son parca yarim kalmis olabilir; bir sonraki chunk'a devredilir.
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (payload.length === 0 || payload === "[DONE]") continue;

        let parsed: GeminiChunk;
        try {
          parsed = JSON.parse(payload) as GeminiChunk;
        } catch {
          continue;
        }

        const text = parsed.candidates?.[0]?.content?.parts
          ?.map((part) => part.text ?? "")
          .join("");
        if (text) controller.enqueue(encoder.encode(text));
      }
    },
  });
}

/**
 * Gemini'ye akis acar. Basarisizlikta null doner; hata ayrintisi cagirana
 * tasinmaz, boylece upstream durumu istemciye sizamaz.
 */
export async function streamAnswer(
  messages: ChatMessage[],
  locale: Locale
): Promise<ReadableStream<Uint8Array> | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY tanimli degil, /api/chat cevap veremiyor.");
    return null;
  }

  const contents = messages.map((message) => ({
    role: message.role,
    parts: [
      {
        // Kullanici metni ayrac icine alinir; model cevaplari oldugu gibi gecer.
        text:
          message.role === "user"
            ? wrapUserText(message.content)
            : message.content,
      },
    ],
  }));

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  let upstream: Response;
  try {
    upstream = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        // Anahtar URL'ye degil basliga konur: ara loglara dusmesin.
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: buildSystemInstruction(locale) }] },
        contents,
        generationConfig: GENERATION_CONFIG,
      }),
      signal: controller.signal,
    });
  } catch (error) {
    console.error("gemini cagrisi basarisiz", error);
    return null;
  } finally {
    // Yanit basliklari geldi: bundan sonrasi akis, sure siniri disinda.
    clearTimeout(timer);
  }

  if (!upstream.ok || !upstream.body) {
    console.error("gemini beklenmeyen yanit dondu", upstream.status);
    return null;
  }

  return upstream.body.pipeThrough(sseToText());
}
