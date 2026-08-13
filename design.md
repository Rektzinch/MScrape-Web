# Design — MScrape

A locked design system for the two-page MScrape application. Every page reads
this file before visual changes are made. Extend this system deliberately; do
not create page-local palettes or typography.

## Genre

Modern-minimal with an editorial utility layer: an operator's workbench printed
on warm paper. The interface is technical, direct, and specific without looking
like a generic SaaS dashboard.

## Macrostructure family

- Dashboard: Workbench with H7 clipped product video, F5 annotated product image,
  F3 factual specification rows, and Ft5 statement close.
- App page: Workbench workspace. The form, feedback, results, and export controls
  are the visual content; no marketing sections are allowed.
- Content pages: not applicable. The product has exactly Dashboard and Produksi.

## Theme

- `--color-paper` oklch(96.5% 0.015 74)
- `--color-paper-2` oklch(93.5% 0.018 72)
- `--color-paper-3` oklch(89.5% 0.022 70)
- `--color-ink` oklch(17% 0.018 54)
- `--color-ink-2` oklch(29% 0.022 54)
- `--color-muted` oklch(40% 0.024 54)
- `--color-rule` oklch(78% 0.024 68)
- `--color-rule-strong` oklch(51% 0.028 62)
- `--color-accent` oklch(48% 0.19 258)
- `--color-accent-warm` oklch(52% 0.17 34)
- `--color-focus` oklch(55% 0.21 258)

Electric cobalt is the action signal. Vermilion is editorial punctuation only.
Combined accent coverage stays below 5% of any viewport.

## Typography

- Display: Bricolage Grotesque Variable, weight 760, normal.
- Body: Archivo Variable, weight 400.
- Technical labels: Archivo Variable with tabular numerals and compact tracking.
- Display tracking: -0.055em.
- Type scale anchor: `--text-display: clamp(3rem, 7vw, 5.25rem)`.

## Spacing

4-point named scale. Values live in `tokens.css`; pages use semantic token names,
never raw colour or font-family values.

## Motion

- Easings: `--ease-out`, `--ease-in`, and `--ease-in-out` from `tokens.css`.
- Dashboard: one coordinated first-paint reveal plus the muted product video.
- Produksi: functional progress and spinner motion only.
- Reduced motion: spatial movement becomes a <=150 ms opacity change; the hero
  video is replaced by its poster.

## Microinteractions stance

- Button press: 1 px down, 100 ms; hover feedback only on fine pointers.
- Focus appears instantly with a high-contrast ring.
- Success stays silent when its result is already visible.
- Form errors name what stopped, why when known, and the next action.

## CTA voice

- Cross-page action: one outlined rectangular switch button in the header.
- Primary production action: dark ink fill, short verb label, square 6 px corners.
- Secondary actions: outlined or typographic; no pills.

## Per-page allowances

- Dashboard may use text, one product image, one product video, and one entrance
  animation. It must not contain the live production form or results table.
- Produksi contains only the live scraper workspace and its operational context.
  It must not contain Dashboard narrative, image, video, or footer statement.

## What pages MUST share

- MSCRAPE wordmark, header dimensions, cross-page button shape, warm paper,
  cobalt action colour, typography, focus style, rule language, and spacing scale.

## What pages MAY differ on

- Dashboard uses spacious editorial rhythm and rich media.
- Produksi uses compact workspace rhythm and denser information.

## Exports

### tokens.css

```css
:root {
  --color-paper: oklch(96.5% 0.015 74);
  --color-paper-2: oklch(93.5% 0.018 72);
  --color-paper-3: oklch(89.5% 0.022 70);
  --color-ink: oklch(17% 0.018 54);
  --color-ink-2: oklch(29% 0.022 54);
  --color-muted: oklch(40% 0.024 54);
  --color-rule: oklch(78% 0.024 68);
  --color-rule-strong: oklch(51% 0.028 62);
  --color-accent: oklch(48% 0.19 258);
  --color-accent-warm: oklch(52% 0.17 34);
  --color-focus: oklch(55% 0.21 258);
  --font-display: "Bricolage Grotesque Variable", sans-serif;
  --font-body: "Archivo Variable", sans-serif;
  --font-mono: "Archivo Variable", sans-serif;
}
```

### Tailwind v4 `@theme`

```css
@theme {
  --color-paper: oklch(96.5% 0.015 74);
  --color-ink: oklch(17% 0.018 54);
  --color-accent: oklch(48% 0.19 258);
  --font-display: "Bricolage Grotesque Variable", sans-serif;
  --font-body: "Archivo Variable", sans-serif;
  --spacing-md: 1rem;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
}
```

### DTCG `tokens.json`

```json
{
  "color": {
    "paper": { "$value": "oklch(96.5% 0.015 74)", "$type": "color" },
    "ink": { "$value": "oklch(17% 0.018 54)", "$type": "color" },
    "accent": { "$value": "oklch(48% 0.19 258)", "$type": "color" }
  },
  "font": {
    "display": { "$value": "Bricolage Grotesque Variable", "$type": "fontFamily" },
    "body": { "$value": "Archivo Variable", "$type": "fontFamily" }
  },
  "space": { "md": { "$value": "1rem", "$type": "dimension" } }
}
```

### shadcn/ui CSS variables

```css
:root {
  --background: 96.5% 0.015 74;
  --foreground: 17% 0.018 54;
  --primary: 48% 0.19 258;
  --primary-foreground: 97% 0.012 74;
  --muted: 93.5% 0.018 72;
  --muted-foreground: 40% 0.024 54;
  --border: 78% 0.024 68;
  --input: 51% 0.028 62;
  --ring: 55% 0.21 258;
  --radius: 0.375rem;
}
```
