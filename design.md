# MScrape — Signal Atlas System

MScrape memakai bahasa visual “signal atlas”: gabungan editorial landing page,
grafik pemetaan kota, dan permukaan kerja data yang padat. Arah ini mengambil
pelajaran dari kualitas kurasi Awwwards, Land-book, Godly, Lapa Ninja, dan Refero,
namun komposisi, identitas, copy, serta perilakunya dibuat khusus untuk MScrape.

## Prinsip

- Satu ide per bidang: value proposition, aksi, bukti produk, manfaat, harga, lalu penutup.
- Bukti produk wajib terlihat dalam viewport pertama di desktop dan langsung setelah aksi di mobile.
- Violet dipakai untuk tindakan dan penekanan utama; biru-violet untuk signal sistem;
  lavender dipakai untuk metadata penting; hijau hanya untuk status hidup.
- Tidak memakai glass card, bento SaaS generik, atau ilustrasi AI; pill hanya dipakai
  pada CTA/control yang memang berperilaku sebagai action.
- Data kosong tidak diperkirakan dan status internal diterjemahkan ke bahasa pengguna.

## Identitas

- Wordmark: uppercase `MSCRAPE` dengan satu bar sinyal blue-violet.
- Display: Bricolage Grotesque Variable, weight 430–590.
- Body/UI: Archivo Variable, weight 400–760.
- Display tracking: -0.04em hingga -0.075em.
- Label teknis: uppercase monospace, 0.52–0.66rem, tracking 0.07–0.12em.

## Warna

- Canvas: `#000000`
- Surface: `#09090b`
- Raised surface: `#18181b`
- Text utama: `#fafafa`
- Text sekunder: `#e4e4e7`
- Muted: `#a1a1aa`
- Rule: `#222225` / `#3f3f46`
- Violet brand: `#2e1b9c`
- Blue-violet signal: `#556af3`
- Lavender metadata: `#8b7dff`
- Live status: `#8cff8c`

## Landing

1. Announcement rail ringkas, header horizontal, dan satu CTA workspace.
2. Desktop memakai hero asimetris: headline besar di kiri, bukti produk di kanan.
3. Mobile memakai urutan copy → command → bukti produk tanpa overlap atau overflow.
4. Empat principles berupa bidang editorial bernomor, bukan kartu lepas.
5. Bukti produk berada di hero; tidak ada blok demonstrasi kedua yang mengulang alur.
6. Harga berupa tiga ticket plans dalam rail scroll-snap: swipe satu kartu per layar
   di mobile dan tetap bisa digeser atau dipilih lewat indeks pada desktop.
7. Audience strip, FAQ linear, dan closing prompt menjadi urutan penutup dengan
   jarak vertikal yang lebih rapat di mobile.

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
- Focus ring blue-violet terlihat di semua kontrol.
- Motion hanya memberi respons pada tombol, dropdown, progress, dan toast.
- `prefers-reduced-motion` mematikan animasi dan transisi non-esensial.
