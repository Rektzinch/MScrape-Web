# Design — MScrape

Sistem desain terkunci untuk aplikasi MScrape dua halaman. Perubahan visual
harus memperpanjang sistem ini, bukan membuat palet atau pola komponen lokal.

## Genre dan struktur

Modern-minimal dengan lapisan utilitas editorial: workbench operator pada kertas
hangat, diberi panel hitam dan sinyal oranye. Dashboard bersifat naratif dan kaya
media; Produksi murni workspace operasional. Keduanya hanya dihubungkan oleh satu
tombol pada header.

- Dashboard: Workbench dengan H7 video produk, alur F4 pada grid koordinat,
  F5 gambar produk beranotasi, tabel fakta F3, dan penutup Ft5.
- Produksi: Workbench padat yang hanya memuat form, aktivasi lisensi, status,
  hasil, filter, dan ekspor. Tidak boleh memuat narasi atau media Dashboard.
- Nav: N1a dibenarkan karena produk hanya memiliki dua tujuan.

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
terang hanya untuk ikon, jalur, dan penanda di atas permukaan hitam. Tidak ada
cobalt, gradient hero, atau warna inline di luar token.

## Tipografi, ruang, dan bentuk

- Display: Bricolage Grotesque Variable, weight 760, normal.
- Body dan label teknis: Archivo Variable; angka memakai tabular numerals.
- Display tracking: -0.055em.
- Skala ruang: kelipatan empat pada `tokens.css`.
- Radius kontrol: 6 px; radius kartu: 8 px; bukan pill.

## Interaksi

- Combobox dibangun khusus dan menggantikan native select. Kontraknya mencakup
  pencarian, ArrowUp/ArrowDown, Enter, Escape, light-dismiss, dan fokus terlihat.
- Opsi limit yang terkunci tetap terlihat dengan hatch + ikon gembok. Klik
  membuka aktivasi inline; lisensi tidak memerlukan login.
- Button press bergerak 1 px selama 100–120 ms. Dropdown masuk selama 180 ms.
- Produksi hanya memakai spinner, progress, dan dropdown sebagai tiga primitive
  motion. `prefers-reduced-motion` mematikan motion spasial.
- Aksi operasional memberi feedback inline, lalu dicatat pada badge aktivitas;
  snackbar dipakai untuk hasil async, kegagalan, aktivasi, dan ekspor.
- Semua target sentuh minimal 44 px dan label klik tidak boleh membungkus.

## Model akses

- Free: 10 hasil, cooldown 300 detik.
- Pro: 10/50/75/100 hasil, cooldown 30 detik.
- Max: 10/50/75/100/150/250/500 hasil, tanpa cooldown.
- Kode aktivasi diverifikasi server dan disimpan dalam cookie HttpOnly,
  SameSite=Lax. Sesi Pro/Max kedaluwarsa tiga bulan sejak kode diredeem.
  API tetap melakukan enforcement walaupun UI dimanipulasi.
- Harga Dashboard: Free Rp0; Pro Rp27.000 / 3 bulan; Max Rp55.000 / 3 bulan.
- Pembelian diarahkan ke admin melalui `https://wa.me/6285111349699`.

## Per halaman

- Dashboard boleh memakai teks, satu gambar produk, satu video produk, pola
  koordinat, ikon garis custom, dan satu entrance animation.
- Produksi tidak boleh memuat gambar/video Dashboard atau footer statement.
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
