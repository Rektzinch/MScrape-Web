# MScrape Web

Frontend Next.js untuk [MScrape](https://github.com/Indra-cahya/MScrape), siap dideploy ke Vercel dan dihubungkan ke backend [gosom/google-maps-scraper](https://github.com/gosom/google-maps-scraper).

Tidak ada seed, hasil demo, statistik buatan, atau fallback data. Tabel hanya dirender dari respons API nyata.

## Menjalankan lokal

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Backend API

Backend scraper memakai browser automation sehingga dijalankan terpisah dari Vercel. Opsi termudah adalah Docker Web API:

```bash
mkdir -p gmapsdata
docker run \
  -v "$PWD/gmapsdata:/gmapsdata" \
  -p 8080:8080 \
  gosom/google-maps-scraper \
  -data-folder /gmapsdata
```

Set variabel berikut di Vercel:

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

- `GET /api/config` — status konfigurasi backend
- `POST /api/scrape` — membuat job scrape
- `GET /api/jobs/:id` — membaca status dan hasil job
- `GET /api/jobs/:id/download` — meneruskan unduhan CSV pada mode web

## Deploy ke Vercel

1. Import repositori ini di Vercel.
2. Tambahkan environment variables sesuai mode backend.
3. Deploy. Build command dan output Next.js terdeteksi otomatis.

## Verifikasi

```bash
npm run typecheck
npm run build
```
