# `src/css/`

Source styles for the Weather App liquid-glass UI.

## Purpose

Single stylesheet defining design tokens (light/dark), glass surfaces, layout, forecast/compare cards, form controls, and empty/loading/error states.

## Key files

| File | Role |
|------|------|
| `main.css` | Entire design system; minified to `assets/css/app.min.css` |

## How they relate

`scripts/build.mjs` runs esbuild on `main.css` → `assets/css/app.min.css`. `index.html` loads only the built file (`?v=` cache-bust).

## Notable patterns

- **Tokens** on `:root` / `[data-theme='light|dark']` — colors, glass blur, radii, motion.
- **Liquid glass primitive** (`.glass-liquid`, `.panel`): frosted backdrop, inset highlight, animated sheen.
- **Component library** in-file: selects, dropdowns, popovers, modals, tooltips, checkboxes/radios/toggles, range sliders, steppers, scrollbars, toasts, state blocks.
- **Prefs hooks**: `body.prefs-stats-roomy`, `body.prefs-motion-reduced`.
- **A11y**: `prefers-reduced-motion` kills decorative animation; focus-visible rings on interactive glass controls.
- **Responsive**: safe-area insets, fluid type, stacked layout ≤900px, touch targets ≥44px, horizontal snap strips, coarse-pointer hover/tooltip handling, landscape short-height rules.
- **Extension**: add new components next to the “Design-system components” section using the same CSS variables.
