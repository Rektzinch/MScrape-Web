# Temuan Review Count Publik

Tanggal pemeriksaan: 2026-08-19.

| Sumber | URL | Temuan yang dipakai |
|---|---|---|
| Respons pencarian Google Maps publik | `https://maps.google.com/search` dengan `tbm=map` | Payload hasil nyata untuk contoh tempat hanya memuat rating pada jalur detail `[4][7]`; jumlah ulasan pada `[4][8]` tidak dikirim. |
| Halaman detail Google Maps publik | `https://www.google.com/maps?cid=10549453364480692475&hl=id` | Konten detail memerlukan state browser yang tidak stabil untuk dibaca serverless tanpa browser otomatis; tidak memberikan fallback server-side yang andal. |
| gosom/google-maps-scraper | https://github.com/gosom/google-maps-scraper | Referensi ini mengambil `ReviewCount` dari detail tempat berbasis browser, bukan dari daftar pencarian ringan. |

Kesimpulan implementasi saat ini: aplikasi harus mempertahankan `reviewCount` bila memang dikirim sumber, menunjukkan status transparan bila tidak tersedia, dan tidak membuat angka ulasan. Enrichment lengkap yang stabil memerlukan Google Places API atau worker browser terkelola.
