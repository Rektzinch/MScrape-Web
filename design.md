# MScrape — Visual System 2026

MScrape memakai bahasa visual “local intelligence workspace”: kanvas publik yang
terang dan fokus mengambil inspirasi dari TokenHarbor, sementara permukaan produk,
ritme garis, dan workspace gelap mengambil inspirasi dari Qoder. Identitas, copy,
data, dan perilaku tetap milik MScrape.

## Prinsip

- Satu ide per bidang: value proposition, aksi, bukti produk, manfaat, harga, lalu penutup.
- Bukti produk wajib terlihat dalam viewport pertama di desktop dan langsung setelah aksi di mobile.
- Hijau hanya untuk status hidup dan tindakan penting, bukan dekorasi massal.
- Tidak memakai hero gradient, glass card, bento SaaS, pill berlebihan, atau ilustrasi AI.
- Data kosong tidak diperkirakan dan status internal diterjemahkan ke bahasa pengguna.

## Identitas

- Wordmark: teks lowercase `mscrape` dengan satu titik sinyal acid lime.
- Display: Bricolage Grotesque Variable, weight 430–590.
- Body/UI: Archivo Variable, weight 400–760.
- Display tracking: -0.04em hingga -0.075em.
- Label teknis: uppercase monospace, 0.52–0.66rem, tracking 0.07–0.12em.

## Warna

- Landing paper: `#f3f2ec`
- Landing ink: `#12130f`
- Landing muted: `#70746b`
- Landing rule: `#d5d5cb`
- Workspace: `#0a0d0c`
- Workspace raised: `#101411`
- Workspace text: `#f5f4ee`
- Workspace rule: `#2a312b`
- Live/action: `#70dd70` dan `#b8ff68`

## Landing

1. Announcement rail ringkas, header horizontal, dan satu CTA Produksi.
2. Desktop memakai hero dua kolom: pesan/aksi di kiri, bukti produk di kanan.
3. Mobile memakai urutan copy → command → bukti produk tanpa overlap atau overflow.
4. Empat promises berupa bidang ber-rule, bukan kartu lepas.
5. Product surface menyandingkan query dan schema dataset yang realistis.
6. Harga berupa comparison rows yang menumpuk bersih di mobile.
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
