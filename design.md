# MScrape — Signal Atlas System

MScrape memakai bahasa visual “signal atlas”: gabungan editorial landing page,
grafik pemetaan kota, dan permukaan kerja data yang padat. Arah ini mengambil
pelajaran dari kualitas kurasi Awwwards, Land-book, Godly, Lapa Ninja, dan Refero,
namun komposisi, identitas, copy, serta perilakunya dibuat khusus untuk MScrape.

## Prinsip

- Satu ide per bidang: value proposition, aksi, bukti produk, manfaat, harga, lalu penutup.
- Bukti produk wajib terlihat dalam viewport pertama di desktop dan langsung setelah aksi di mobile.
- Coral dipakai untuk tindakan dan penekanan; ungu untuk bidang sistem; kuning
  untuk metadata penting; hijau hanya untuk status hidup.
- Tidak memakai glass card, bento SaaS generik, pill berlebihan, atau ilustrasi AI.
- Data kosong tidak diperkirakan dan status internal diterjemahkan ke bahasa pengguna.

## Identitas

- Wordmark: uppercase `MSCRAPE` dengan satu bar sinyal coral.
- Display: Bricolage Grotesque Variable, weight 430–590.
- Body/UI: Archivo Variable, weight 400–760.
- Display tracking: -0.04em hingga -0.075em.
- Label teknis: uppercase monospace, 0.52–0.66rem, tracking 0.07–0.12em.

## Warna

- Landing paper: `#f3efe6`
- Landing ink: `#11121a`
- Landing muted: `#696975`
- Landing rule: `#cbc4b7`
- Coral signal: `#ff5a3d`
- System violet: `#6558f5`
- Metadata yellow: `#ffd34e`
- Workspace: `#11121a`
- Workspace raised: `#1a1b26`
- Workspace text: `#f6f1e8`
- Live status: `#a8e56a`

## Landing

1. Announcement rail ringkas, header horizontal, dan satu CTA workspace.
2. Desktop memakai hero asimetris: headline besar di kiri, bukti produk di kanan.
3. Mobile memakai urutan copy → command → bukti produk tanpa overlap atau overflow.
4. Empat principles berupa bidang editorial bernomor, bukan kartu lepas.
5. Product surface menyandingkan query dan schema dataset yang realistis.
6. Harga berupa tiga ticket plans dengan latar berbeda yang menumpuk bersih di mobile.
7. Audience strip, FAQ linear, dan closing prompt menjadi urutan penutup.

## Produksi

- Masthead ringkas menjelaskan hubungan panel query dan dataset.
- Status lisensi berupa utility rail; tanggal tetap di disclosure.
- Desktop: status lisensi di row pertama, query sticky di kolom kiri, dataset di kanan.
- Tablet/mobile: lisensi → query → hasil ditumpuk dengan grid row eksplisit.
- Form default hanya menampilkan niche, wilayah, cakupan, dan jumlah hasil.
- Negara/bahasa tetap berada di Pengaturan lanjutan.
- Search, filter, statistik, tabel, dan ekspor baru muncul saat hasil tersedia.
- Tabel desktop tetap tabel; mobile mengikuti fallback kartu yang sudah ada.

## Akses dan harga

- Free: 10 scan, maksimal 10 bisnis per scan, jeda satu jam.
- Pro: 500 scan, maksimal 250 bisnis per scan, tanpa cooldown, aktif dua bulan.
- Max: 1.500 scan, maksimal 500 bisnis per scan, tanpa cooldown, aktif dua bulan.
- Satu pencarian selalu memakai satu scan.

## Interaksi

- Target sentuh minimum 44 px.
- Focus ring acid lime terlihat di semua kontrol.
- Motion hanya memberi respons pada tombol, dropdown, progress, dan toast.
- `prefers-reduced-motion` mematikan animasi dan transisi non-esensial.
