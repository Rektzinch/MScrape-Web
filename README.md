# MScrape Web

Frontend Next.js untuk MScrape, siap dideploy ke Vercel. Pencarian default meminta Google Maps live tanpa data demo. Hasil hanya dirender dari respons aktual dan dapat difilter lalu diekspor ke CSV.

> **Keamanan produksi.** Branch ini menolak scan serta aktivasi bila storage keamanan durable belum dikonfigurasi. Tidak ada fallback ke limiter memori atau cookie untuk enforcement biaya dan entitlement.

## Menjalankan lokal

```bash
npm install
cp .env.example .env.local
npm run dev
```

Untuk menjalankan semua pemeriksaan sebelum pull request:

```bash
npm run typecheck
npm test
npm run build
```

## Paket dan kontrak hasil

| Tier | Harga | Batas hasil per scan | Cooldown |
| --- | --- | ---: | --- |
| Free | Rp0 | 10 | 1 jam |
| Pro | Rp24.999 / 2 bulan | Hingga 250 | 1 menit |
| Max | Rp149.000 / 2 bulan | Hingga 500 | Tanpa cooldown |

Semua limit divalidasi oleh server. Mode `all` tidak diberikan kepada pelanggan karena hasil tak terbatas tidak dapat dijamin oleh provider dalam satu request. Respons scan mengirim metadata kelengkapan: `limit-reached`, `source-exhausted`, atau `time-budget`. UI menampilkan status tersebut agar hasil parsial tidak dianggap lengkap.

## Kontrol keamanan dan penyalahgunaan

### Storage durable wajib

Set `UPSTASH_REDIS_REST_URL` dan `UPSTASH_REDIS_REST_TOKEN` di Vercel. Store ini menjadi sumber kebenaran untuk tiga kontrol berikut.

| Kontrol | Implementasi |
| --- | --- |
| Cooldown | Redis `SET NX EX` atomik, sehingga cooldown tidak hilang bila cookie dihapus atau request pindah instance serverless. |
| Lisensi | Ledger menyimpan ID lisensi, tier, masa aktif, dan status revocation; kode valid hanya dapat diaktifkan satu kali. |
| Ownership job | Job backend dipetakan ke sesi pengunjung; status serta CSV hanya tersedia untuk browser yang membuat job. |

Cookie sesi tetap `HttpOnly`, `SameSite=Lax`, dan `Secure` pada produksi, tetapi cookie tidak menjadi sumber kebenaran cooldown maupun lisensi. Kegagalan Redis menyebabkan endpoint aman menolak operasi dengan HTTP 503, bukan membuka akses.

### Cloudflare dan Turnstile

Gunakan custom domain yang diproxy Cloudflare di depan Vercel. Untuk scan Free, konfigurasi Turnstile dengan pasangan berikut:

```env
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
```

Saat kedua variabel diisi, UI meminta challenge dan `POST /api/scrape` memverifikasi token pada server sebelum limiter atau Google Maps dipanggil. Atur `MSCRAPE_TRUSTED_IP_HEADER=cf-connecting-ip` hanya bila domain benar-benar berada di belakang Cloudflare. Di Vercel, blokir atau lindungi akses origin langsung agar pengguna tidak dapat mengirim header Cloudflare palsu.

Cloudflare tetap digunakan sebagai lapisan pertama untuk WAF, rate limiting path `POST /api/scrape`, rate limiting `POST /api/license/activate`, dan proteksi bot. Ia bukan pengganti Redis atau verifikasi entitlement server-side.

### Lisensi dan revokasi

Buat kode lisensi dengan secret yang hanya ada di environment server:

```bash
npm run license:generate -- pro
npm run license:generate -- max
```

Kode yang sudah diredeem tidak dapat dipakai ulang. Untuk mencabut lisensi individual, gunakan ID 12 karakter hex pada kode:

```bash
npm run license:revoke -- ABCDEF123456
```

Revokasi berlaku pada request berikutnya karena server memeriksa ledger. Jangan membagikan `MSCRAPE_LICENSE_SECRET`, `UPSTASH_REDIS_REST_TOKEN`, token Vercel, atau kode lisensi pelanggan melalui repository, chat publik, atau browser client.

## Backend Google Maps opsional

Backend browser automation dijalankan terpisah dari Vercel. Contoh Docker Web API:

```bash
mkdir -p gmapsdata
docker run \
  -v "$PWD/gmapsdata:/gmapsdata" \
  -p 8080:8080 \
  gosom/google-maps-scraper \
  -data-folder /gmapsdata
```

Untuk memakai backend:

```env
MAPS_API_BASE_URL=https://alamat-backend-kamu.example
MAPS_API_MODE=web
# MAPS_API_KEY=opsional-bila-backend-memerlukannya
```

Endpoint status dan download job melakukan ownership check sebelum meneruskan ID ke backend. Tetapkan `MSCRAPE_JOB_OWNERSHIP_TTL_SECONDS` agar sama atau lebih besar dari masa retensi job backend.

## Endpoint

| Endpoint | Fungsi |
| --- | --- |
| `GET /api/config` | Status provider, tier, cooldown durable, dan status challenge. |
| `POST /api/license/activate` | Validasi kode dan aktivasi satu kali pada ledger. |
| `POST /api/scrape` | Validasi input, tier, Turnstile bila tersedia, limiter durable, lalu scan atau membuat job. |
| `GET /api/jobs/:id` | Membaca job milik sesi pembuat. |
| `GET /api/jobs/:id/download` | Mengunduh CSV milik sesi pembuat pada mode web. |

## Deploy dan kontrol perubahan

Saat ini source produksi berasal dari `agent/redesign-dashboard-produksi`. Branch `security` harus direview lalu di-merge ke branch produksi tersebut; jangan menganggap `main` sebagai source deployment sebelum konfigurasi Vercel juga dipindahkan.

Sebelum deploy produksi, pastikan:

1. Vercel menunjuk branch produksi yang benar dan environment production berisi seluruh variabel `.env.example` yang wajib.
2. Custom domain berada di belakang Cloudflare dan origin direct Vercel tidak dapat menjadi jalur bypass.
3. Branch produksi dilindungi dengan pull request, review, dan pemeriksaan CI yang lulus.
4. Deployment preview menjalankan `npm run typecheck`, `npm test`, dan `npm run build` sebelum perubahan dipromosikan.
5. Token yang pernah dibagikan melalui media tidak aman sudah dirotasi.

## Security headers

`next.config.ts` menerapkan CSP yang mengizinkan aset internal dan Cloudflare Turnstile, serta `X-Content-Type-Options`, frame protection, Referrer-Policy, Permissions-Policy, COOP, dan CORP. Perubahan CSP harus diuji pada preview karena perubahan asset pihak ketiga memerlukan allowlist eksplisit.
