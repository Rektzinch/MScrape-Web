# Validasi UI Lokal — 2026-08-19

| Halaman | Temuan |
|---|---|
| `/` | Fold baru tampil sebagai komposisi split: copy dan CTA diikuti visual workspace, lalu ringkasan sumber/cakupan/output. Harga tampil sebelum penjelasan SEO panjang; hero Dashboard duplikat telah dihapus. |
| `/produksi` | Halaman form dan status lisensi tetap dirender setelah override kartu perangkat sentuh. Belum ada data hasil pada sesi Free lokal, sehingga tabel tidak dapat divalidasi dengan data nyata dari UI tanpa melakukan scan. |

Catatan: CSS kartu hasil perangkat sentuh ditulis sebagai override akhir untuk `(max-width: 59.99rem), (pointer: coarse)`, sehingga tabel tidak kembali menjadi desktop pada perangkat sentuh dengan viewport besar.

## Motion Homepage

Fold Homepage diverifikasi kembali setelah penambahan motion. Headline dan CTA harus tetap langsung tampak saat halaman dibuka; karena itu motion berbasis `view()` diterapkan pada bagian setelah fold, sedangkan visual fold hanya memakai transisi masuk biasa. Seluruh motion memiliki override `prefers-reduced-motion: reduce`.

## Verifikasi produksi

Deployment produksi pada `https://mscrape.web.id/` berhasil menampilkan fold dengan visual workspace, menu, dan CTA Produksi. Rute lama `https://mscrape.web.id/dashboard` juga telah mengalihkan ke Homepage.

## Analytics dan motion hero lokal

Homepage lokal menampilkan CTA yang dapat dicatat serta kontrol lokasi presisi opsional. Konsol tidak menunjukkan kesalahan aplikasi dari pemancar analytics atau lapisan grafis hero; satu peringatan `eval()` berasal dari mode pengembangan React dan tidak berlaku pada build produksi.

Lapisan grafis Hero juga diverifikasi di DOM: tiga node, orbit, dan garis sinyal dirender di atas visual workspace; node memakai animasi `home-signal-pulse` saat pengguna tidak memilih reduced-motion.

Verifikasi pengiriman event lokal mencapai endpoint yang benar, tetapi ledger mengembalikan status tidak tersedia karena server pengembangan tidak menerima kredensial penyimpanan durable. Pengujian pencatatan nyata dijadwalkan pada deployment produksi yang memiliki konfigurasi Redis.
