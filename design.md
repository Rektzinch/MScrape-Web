# MScrape — Visual System 2026

MScrape memakai bahasa visual “cartographic data workspace”: antarmuka yang terasa
seperti indeks riset modern, bukan landing SaaS generik. Sistem ini menggantikan
seluruh tema krem, panel hitam dominan, logo gambar, kartu harga horizontal, dan
hero dua kolom dari versi sebelumnya.

## Prinsip

- Struktur terlihat sebelum dekorasi: headline, indeks, rule, dataset, dan aksi.
- Landing menjelaskan alur sekali; Produksi langsung menempatkan query dan hasil.
- Cobalt hanya untuk arah dan tindakan utama. Mint menandai sumber atau status hidup.
- Tidak memakai gradient hero, glass card bertumpuk, pill berlebihan, atau ilustrasi AI.
- Data kosong tidak diperkirakan dan status internal diterjemahkan ke bahasa pengguna.

## Identitas

- Wordmark: teks `MScrape` dengan monogram `M` pada tile navy.
- Display: Bricolage Grotesque Variable, weight 510–720.
- Body/UI: Archivo Variable, weight 400–760.
- Display tracking: -0.06em hingga -0.072em.
- Label indeks: uppercase, 0.60–0.74rem, tracking 0.08–0.13em.

## Warna

- Paper: `oklch(98.5% 0.006 248)`
- Paper 2: `oklch(96% 0.014 248)`
- Paper 3: `oklch(92.5% 0.025 248)`
- Ink: `oklch(19% 0.045 258)`
- Ink 2: `oklch(31% 0.05 258)`
- Muted: `oklch(49% 0.04 255)`
- Rule: `oklch(85% 0.025 250)`
- Cobalt/action: `oklch(55% 0.22 260)`
- Mint/live: `oklch(79% 0.16 160)`

## Landing

1. Header horizontal dengan wordmark, anchor konten, dan CTA Produksi.
2. Hero tipografis satu kolom dengan status sumber dan satu pesan utama.
3. Product preview berbasis markup yang mencerminkan query builder dan dataset baru.
4. Cara kerja berupa indexed rows pada bidang navy.
5. Struktur data berupa ledger; pricing berupa comparison rows, bukan kartu carousel.
6. Use case berupa grid berindeks, diikuti FAQ dan CTA cobalt.

## Produksi

- Masthead ringkas menjelaskan hubungan panel kiri dan kanan.
- Status lisensi berupa satu utility rail; tanggal tetap di disclosure.
- Desktop: query builder sticky di kiri, dataset di kanan.
- Tablet/mobile: kedua panel ditumpuk dengan query selalu lebih dulu.
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
- Focus ring cobalt terlihat di semua kontrol.
- Motion hanya memberi respons pada tombol, dropdown, progress, dan toast.
- `prefers-reduced-motion` mematikan animasi dan transisi non-esensial.
