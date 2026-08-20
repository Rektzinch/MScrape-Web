# Design — MScrape

Sistem desain terkunci untuk aplikasi MScrape dua halaman. Perubahan visual
harus memperpanjang sistem ini, bukan membuat palet atau pola komponen lokal.

## Genre dan struktur

Modern-minimal dengan lapisan utilitas editorial: workbench operator pada kertas
hangat, diberi panel hitam dan sinyal oranye. Dashboard bersifat naratif dan kaya
media; Produksi murni workspace operasional. Keduanya hanya dihubungkan oleh satu
tombol pada header.

- Dashboard: Field Ledger dengan H2 split diptych, satu F5 gambar produk beranotasi,
  alur F4, daftar data F3, pricing, use case, FAQ, CTA, dan penutup Ft2.
- Produksi: Field Ledger padat yang hanya memuat form, aktivasi lisensi, status,
  hasil, filter, dan ekspor. Tidak boleh memuat narasi atau media Dashboard.
- Nav: N9 edge-aligned minimal; wordmark dan satu trigger menu menjadi dua jangkar.
  Footer memakai Ft2 inline rule agar tidak mengulang sitemap panjang.

## Tema

- `--color-paper` oklch(96.5% 0.017 70)
- `--color-paper-2` oklch(93.5% 0.021 68)
- `--color-paper-3` oklch(89.5% 0.025 65)
- `--color-ink` oklch(17% 0.018 48)
- `--color-ink-2` oklch(29% 0.022 48)
- `--color-muted` oklch(40% 0.026 48)
- `--color-rule` oklch(78% 0.028 64)
- `--color-rule-strong` oklch(51% 0.034 54)
- `--color-accent` oklch(47% 0.18 38)
- `--color-accent-warm` oklch(70% 0.17 58)
- `--color-focus` oklch(39% 0.17 32)

Hitam hangat adalah permukaan kerja dan oranye gelap adalah warna aksi. Oranye
terang dipakai untuk ikon, jalur, penanda di atas permukaan hitam, serta campuran
tipis pada kotak ringkasan dan judul hasil. Tidak ada cobalt, gradient hero, atau
warna inline di luar token.

## Tipografi, ruang, dan bentuk

- Display: Bricolage Grotesque Variable, weight 760, normal.
- Body dan label teknis: Archivo Variable; angka memakai tabular numerals.
- Display tracking: -0.055em.
- Skala ruang: kelipatan empat pada `tokens.css`.
- Radius kontrol: 6 px; radius kartu: 8 px; bukan pill.

## Interaksi

- Combobox dibangun khusus dan menggantikan native select. Kontraknya mencakup
  pencarian, ArrowUp/ArrowDown, Enter, Escape, light-dismiss, dan fokus terlihat.
- Popover batas hasil keluar dari frame konsol, sedangkan daftar opsi memiliki
  scroll internal agar preset terakhir tetap dapat dicapai pada viewport pendek.
- Opsi batas hasil disaring berdasarkan tier aktif: Free hanya melihat 10,
  Pro melihat preset hingga 250, sedangkan Max memakai input custom langsung.
- Button press bergerak 1 px selama 100–120 ms. Dropdown masuk selama 180 ms.
- Produksi memakai spinner, progress, dropdown, dan fade singkat toast sebagai
  primitive motion. `prefers-reduced-motion` mematikan motion spasial.
- Aksi operasional memberi feedback inline melalui Feedback center; snackbar
  dipakai untuk hasil async, kegagalan, aktivasi, dan ekspor.
- Dashboard memakai fade masuk/keluar progresif hanya pada scene utama ketika
  melewati viewport; mode reduced-motion menjadikannya statis.
- Semua target sentuh minimal 44 px dan label klik tidak boleh membungkus.

## Model akses

- Free: 10 hasil, cooldown satu jam.
- Pro: preset 10/50/75/100/150/250 dan jumlah custom kosong secara default
  hingga 250 hasil, tanpa cooldown.
- Max: tanpa menu preset; input custom kosong secara default. Nilai kosong
  meminta semua hasil cocok di area, sedangkan angka positif menjadi target;
  tanpa cooldown.
- Kode aktivasi diverifikasi server dan disimpan dalam cookie HttpOnly,
  SameSite=Lax. Sesi Pro/Max kedaluwarsa satu bulan sejak kode diredeem.
  API tetap melakukan enforcement walaupun UI dimanipulasi.
- Harga Dashboard: Free Rp0; Pro Rp24.999 / 2 bulan; Max Rp149.000 / 2 bulan.
- Kartu harga membedakan jatah scan dan batas bisnis per scan. Harga ditempatkan
  setelah alur dan daftar data sebagai rail horizontal dengan scroll-snap;
  kartu berikutnya tetap terlihat sebagian di mobile.
- Pembelian diarahkan ke admin melalui `https://wa.me/6285111349699`.
- Cooldown Free tetap mengikuti cookie browser ketika smartphone berpindah
  antara mode situs mobile dan desktop.

## Per halaman

- Dashboard memakai satu gambar produk, pola survey-grid koordinat, dan motion
  hanya pada state interaktif. Tidak ada carousel otomatis atau permission lokasi.
- Produksi tidak boleh memuat gambar/video Dashboard atau footer statement.
- Produksi mewarisi survey-grid dan masthead hitam-oranye Dashboard tanpa
  membawa konten naratifnya. Hasil scan memakai ledger padat, pencarian lokal,
  dan pagination 50 baris. Filter awal selalu “Semua bisnis”, sehingga seluruh
  baris yang diterima tetap tampil sampai pengguna memilih filter lain.
- Status lisensi menjadi bar ringkas: tier, sisa scan, Upgrade, dan Aktivasi.
  Tanggal aktivasi, masa berakhir, serta tombol perbarui status berada di
  disclosure "Detail lisensi".
- Form utama hanya menampilkan Cari apa, Di mana, Cakupan, dan Jumlah hasil.
  Negara serta Bahasa berada dalam "Pengaturan lanjutan". Aksi lokasi perangkat
  berada di dekat field wilayah dan tidak pernah muncul pada landing page.
- Free tidak merender kontrol custom. Pro hanya merender preset miliknya dan
  input custom kosong; Max hanya merender input custom kosong.
- Sebelum scan pertama, hasil hanya menampilkan empty state. Search, filter,
  statistik, dan ekspor baru dirender setelah hasil tersedia. Nomor urut hasil
  tetap memakai badge hitam; status scan memakai bahasa pengguna, bukan istilah API.
- Keduanya berbagi wordmark, header, tombol lintas halaman, tokens, font, focus
  ring, dan bahasa rule.

## Exports

### `tokens.css` — sumber utama

```css
:root {
  --color-paper: oklch(96.5% 0.017 70);
  --color-paper-2: oklch(93.5% 0.021 68);
  --color-paper-3: oklch(89.5% 0.025 65);
  --color-ink: oklch(17% 0.018 48);
  --color-ink-2: oklch(29% 0.022 48);
  --color-muted: oklch(40% 0.026 48);
  --color-rule: oklch(78% 0.028 64);
  --color-rule-strong: oklch(51% 0.034 54);
  --color-accent: oklch(47% 0.18 38);
  --color-accent-warm: oklch(70% 0.17 58);
  --color-accent-ink: oklch(97% 0.012 74);
  --color-focus: oklch(39% 0.17 32);
  --font-display: "Bricolage Grotesque Variable", "Archivo Variable", sans-serif;
  --font-body: "Archivo Variable", Arial, sans-serif;
  --font-mono: "Archivo Variable", Arial, sans-serif;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in: cubic-bezier(0.7, 0, 0.84, 0);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
}
```

### Tailwind v4 `@theme`

```css
@theme {
  --color-paper: oklch(96.5% 0.017 70);
  --color-paper-2: oklch(93.5% 0.021 68);
  --color-paper-3: oklch(89.5% 0.025 65);
  --color-ink: oklch(17% 0.018 48);
  --color-ink-2: oklch(29% 0.022 48);
  --color-muted: oklch(40% 0.026 48);
  --color-rule: oklch(78% 0.028 64);
  --color-accent: oklch(47% 0.18 38);
  --color-accent-warm: oklch(70% 0.17 58);
  --color-focus: oklch(39% 0.17 32);
  --font-display: "Bricolage Grotesque Variable", "Archivo Variable", sans-serif;
  --font-body: "Archivo Variable", Arial, sans-serif;
  --font-mono: "Archivo Variable", Arial, sans-serif;
  --spacing-xs: 0.5rem;
  --spacing-sm: 0.75rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2.5rem;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
}
```

### DTCG `tokens.json`

```json
{
  "$schema": "https://design-tokens.github.io/community-group/format/",
  "color": {
    "paper": { "$value": "oklch(96.5% 0.017 70)", "$type": "color" },
    "paper-2": { "$value": "oklch(93.5% 0.021 68)", "$type": "color" },
    "paper-3": { "$value": "oklch(89.5% 0.025 65)", "$type": "color" },
    "ink": { "$value": "oklch(17% 0.018 48)", "$type": "color" },
    "ink-2": { "$value": "oklch(29% 0.022 48)", "$type": "color" },
    "muted": { "$value": "oklch(40% 0.026 48)", "$type": "color" },
    "rule": { "$value": "oklch(78% 0.028 64)", "$type": "color" },
    "accent": { "$value": "oklch(47% 0.18 38)", "$type": "color" },
    "accent-warm": { "$value": "oklch(70% 0.17 58)", "$type": "color" },
    "focus": { "$value": "oklch(39% 0.17 32)", "$type": "color" }
  },
  "font": {
    "display": { "$value": "Bricolage Grotesque Variable, Archivo Variable, sans-serif", "$type": "fontFamily" },
    "body": { "$value": "Archivo Variable, Arial, sans-serif", "$type": "fontFamily" },
    "mono": { "$value": "Archivo Variable, Arial, sans-serif", "$type": "fontFamily" }
  },
  "space": {
    "xs": { "$value": "0.5rem", "$type": "dimension" },
    "sm": { "$value": "0.75rem", "$type": "dimension" },
    "md": { "$value": "1rem", "$type": "dimension" },
    "lg": { "$value": "1.5rem", "$type": "dimension" },
    "xl": { "$value": "2.5rem", "$type": "dimension" }
  },
  "duration": {
    "fast": { "$value": "120ms", "$type": "duration" },
    "base": { "$value": "200ms", "$type": "duration" },
    "slow": { "$value": "420ms", "$type": "duration" }
  }
}
```

### shadcn/ui CSS variables

```css
:root {
  --background: 96.5% 0.017 70;
  --foreground: 17% 0.018 48;
  --card: 93.5% 0.021 68;
  --card-foreground: 17% 0.018 48;
  --popover: 93.5% 0.021 68;
  --popover-foreground: 17% 0.018 48;
  --primary: 47% 0.18 38;
  --primary-foreground: 97% 0.012 74;
  --secondary: 89.5% 0.025 65;
  --secondary-foreground: 29% 0.022 48;
  --muted: 78% 0.028 64;
  --muted-foreground: 40% 0.026 48;
  --accent: 47% 0.18 38;
  --accent-foreground: 97% 0.012 74;
  --destructive: 46% 0.18 26;
  --destructive-foreground: 97% 0.012 74;
  --border: 78% 0.028 64;
  --input: 51% 0.034 54;
  --ring: 39% 0.17 32;
  --radius: 0.375rem;
}
```
