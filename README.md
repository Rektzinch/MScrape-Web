# MScrape Web

Frontend Next.js untuk [MScrape](https://github.com/Indra-cahya/MScrape), siap dideploy ke Vercel. Pencarian default membaca respons Google Maps langsung menggunakan format fast mode dari [gosom/google-maps-scraper](https://github.com/gosom/google-maps-scraper), tanpa API key.

Tidak ada seed, hasil demo, statistik buatan, atau fallback data. Tabel hanya dirender dari respons API nyata.

## Menjalankan lokal

```bash
npm install
cp .env.example .env.local
npm run dev
```

## API siap pakai

Tidak ada environment variable wajib. Route `POST /api/scrape` membuat satu request server ke Google Maps dan dapat mengembalikan hingga 100 tempat nyata secara sinkron. Fetch memakai `cache: "no-store"`; route juga mengirim `Cache-Control: no-store`.

Jika host utama Google gagal, terkena rate limit, atau mengembalikan format yang tidak dapat dibaca, route mencoba host pencarian Google cadangan di dalam request pengguna yang sama.

## Backend Google Maps DOM opsional

Backend scraper memakai browser automation sehingga dijalankan terpisah dari Vercel. Opsi termudah adalah Docker Web API:

```bash
mkdir -p gmapsdata
docker run \
  -v "$PWD/gmapsdata:/gmapsdata" \
  -p 8080:8080 \
  gosom/google-maps-scraper \
  -data-folder /gmapsdata
```

Untuk mengganti sumber default dengan backend Google Maps milikmu, set variabel berikut di Vercel:

```env
MAPS_API_BASE_URL=https://alamat-backend-kamu.example
MAPS_API_MODE=web
```

Untuk edisi queue/API-key:

```env
MAPS_API_BASE_URL=https://alamat-backend-kamu.example
MAPS_API_MODE=queue
MAPS_API_KEY=api-key-kamu
```

`MAPS_API_KEY` tidak pernah dikirim ke browser. Route Handler Next.js meneruskan permintaan dari frontend ke backend.

## Endpoint frontend

- `GET /api/config` — sumber API yang sedang aktif
- `POST /api/scrape` — mencari langsung via Google Maps atau membuat job backend
- `GET /api/jobs/:id` — membaca status dan hasil job
- `GET /api/jobs/:id/download` — meneruskan unduhan CSV pada mode web

## Deploy ke Vercel

1. Import repositori ini di Vercel.
2. Deploy. Build command dan output Next.js terdeteksi otomatis.
3. Environment backend Google Maps bersifat opsional.

## Verifikasi

```bash
npm run typecheck
npm run build
```
