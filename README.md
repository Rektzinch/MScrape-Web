# MScrape Web

Frontend Next.js untuk [MScrape](https://github.com/Indra-cahya/MScrape), siap dideploy ke Vercel. Pencarian default membaca respons Google Maps langsung menggunakan format fast mode dari [gosom/google-maps-scraper](https://github.com/gosom/google-maps-scraper), tanpa API key.

Tidak ada seed, hasil demo, statistik buatan, atau fallback data. Tabel hanya dirender dari respons API nyata.

## Menjalankan lokal

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Tier tanpa login

Pengguna tidak membuat akun. Semua sesi dimulai sebagai Free; opsi yang terkunci
akan meminta kode aktivasi yang dibeli dari admin.

| Tier | Batas hasil | Cooldown |
| --- | --- | --- |
| Free | 10 | 5 menit |
| Pro | 10, 50, 75, 100 | 30 detik |
| Max | 10, 50, 75, 100, 150, 250, 500 | Tanpa cooldown |

API memvalidasi tier dan cooldown di server. Lisensi disimpan sebagai cookie
HttpOnly/SameSite=Lax, sedangkan cooldown memakai identitas client atau lisensi
serta cookie yang ditandatangani. Manipulasi combobox di browser tidak membuka
batas yang terkunci.

Tambahkan rahasia minimal 32 karakter:

```env
MSCRAPE_LICENSE_SECRET=rahasia-acak-minimal-32-karakter
```

Admin dapat menerbitkan kode tanpa mengubah source:

```bash
npm run license:generate -- pro
npm run license:generate -- max
```

Jangan commit `.env.local` atau membagikan `MSCRAPE_LICENSE_SECRET`. Pengguna
hanya menerima kode `MSC1-PRO-…` atau `MSC1-MAX-…` yang dihasilkan.

## API siap pakai

Route `POST /api/scrape` membuat satu request server ke Google Maps dan menerima
batas sampai 500 tempat sesuai tier. Fetch memakai `cache: "no-store"`; route
juga mengirim `Cache-Control: no-store`.

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
- `POST /api/license/activate` — memverifikasi kode dan mengaktifkan tier
- `POST /api/scrape` — mencari langsung via Google Maps atau membuat job backend
- `GET /api/jobs/:id` — membaca status dan hasil job
- `GET /api/jobs/:id/download` — meneruskan unduhan CSV pada mode web

## Deploy ke Vercel

1. Import repositori ini di Vercel.
2. Deploy. Build command dan output Next.js terdeteksi otomatis.
3. Tambahkan `MSCRAPE_LICENSE_SECRET` untuk mengaktifkan lisensi Pro/Max.
4. Environment backend Google Maps tetap opsional.

## Verifikasi

```bash
npm run typecheck
npm run build
```
