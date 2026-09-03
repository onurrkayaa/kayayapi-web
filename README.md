This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Asistan uç noktası — dağıtım notları

`/api/chat`, Gemini'ye para harcayan tek yoldur. Koddaki IP hız sınırı
Cloudflare Workers'ta izolasyon başına ayrı çalıştığı için *best-effort*
kabul edilmelidir. Asıl sınır Cloudflare panelinde kurulur:

**Security → WAF → Rate limiting rules → Create rule**
- Eşleşme ifadesi: `http.request.uri.path eq "/api/chat"`
- Sayaç: IP adresi
- Eşik: 1 dakikada 10 istek
- Eylem: Block, 60 saniye

Ücretsiz planda bir kural hakkı vardır ve bu kural o hakka değer.

### Ortam değişkenleri

Değerler üç yere ayrılır ve bu ayrım isteğe bağlı değil:

| Nerede | Ne | Neden |
| --- | --- | --- |
| `.env.development.local` (repoda değil) | `GEMINI_API_KEY`, `TURNSTILE_SECRET_KEY` | Yalnızca `npm run dev` okur. `.env.local`'da **durmamalı**: OpenNext derleme sırasında `.env.local`'ı okuyup içindeki her değeri Worker paketine yazıyor. |
| `.env.production` (repoda) | `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `NEXT_PUBLIC_SITE_URL` | `NEXT_PUBLIC_` değerleri derleme anında pakete gömülür; gizli değildir. |
| `wrangler secret put` | `GEMINI_API_KEY`, `TURNSTILE_SECRET_KEY` | Üretimde gizli değerlerin tek kaynağı. |

`NEXT_PUBLIC_SITE_URL` yerelde **tanımlanmaz**. Next `.env.local`'a
`.env.production`'dan daha yüksek öncelik verir; yerelde `localhost` yazarsanız
üretim derlemesine de o girer ve Origin kontrolü canlıda her isteği `403`'ler.
Geliştirmede `localhost` zaten ayrıca kabul ediliyor.

### Cloudflare'e dağıtım

```bash
npx wrangler login
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put TURNSTILE_SECRET_KEY
npm run deploy
```

`npm run preview` aynı paketi yerelde Workers çalışma zamanında açar.

Her iki komut da derlemeden sonra `scripts/strip-build-env.mjs` çalıştırır.
Bu adım gereklidir: OpenNext `.open-next/cloudflare/next-env.mjs` dosyasına
`production`, `development` ve `test` bloklarını birlikte yazar, dosya Worker'ın
içine girer ve `development` bloğu yerel gizli değerleri taşır. Betik üretim
dışı blokları boşaltır, böylece pakete hiçbir gizli değer girmez.

### Turnstile

Widget görünmez (`execution: "execute"`, `appearance: "interaction-only"`)
modda çalışır. Cloudflare panelinde Turnstile sitesinin hostname listesine
alan adının eklenmiş olması gerekir. **localhost'ta çalışmaz** — widget
`https://localhost` üzerinden doğrulama denediği için SSL hatası alır.
Yerel geliştirmede Cloudflare'in test anahtarları kullanılabilir:
`NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA` ve
`TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA`.
