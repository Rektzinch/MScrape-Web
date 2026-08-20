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

Pada produksi, dua pengiriman `page_view` dari sesi browser yang sama menghasilkan `accepted: true` dan `recorded: false` keduanya, yang mengonfirmasi event awal dari pemuatan halaman telah direkam dan event ganda tidak ditulis kembali.

Query analytics panel admin yang terautentikasi berhasil membaca ringkasan produksi: pengunjung hari ini dan tujuh hari, jumlah event, klik CTA, jam puncak, histogram 24 jam, serta aktivitas terbaru tersedia melalui gateway yang sama dengan ledger lisensi.

Verifikasi visual panel produksi setelah autentikasi memperlihatkan blok **Live analytics** dengan jumlah pengunjung, klik CTA, event, jam tersibuk, grafik per jam, dan feed event yang memuat waktu serta lokasi jaringan atau lokasi opt-in ketika tersedia.

Pada build panel terakhir, status sinkronisasi menampilkan waktu hingga detik dan feed memuat event produksi aktual setelah query awal selesai. Hal ini memungkinkan interval auto-refresh 10 detik dibaca secara presisi.

Pengamatan langsung pada panel produksi mengonfirmasi refresh otomatis: timestamp sinkronisasi berubah dari `06.27.48` menjadi `06.28.00` tanpa memuat ulang halaman.
