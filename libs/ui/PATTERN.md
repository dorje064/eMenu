# eMenu UI library — component authoring conventions

Follow these EXACTLY so every component is consistent. Read the reference
files before writing: `src/lib/Button/Button.tsx`, `Button.css`,
`Button.stories.tsx`, and `src/styles/tokens.css`.

## File layout

Each component gets its own folder under `src/lib/<ComponentName>/`:

- `<ComponentName>.tsx` — the component
- `<ComponentName>.css` — styles (plain CSS, imported at top of the .tsx)
- `<ComponentName>.stories.tsx` — Storybook stories

## Component rules

- Default export AND named export of the component.
- Use `forwardRef` when the component wraps a single DOM element.
- Props interface named `<ComponentName>Props`, fully typed, with JSDoc on
  non-obvious props and `@default` notes. Extend the right HTML attributes
  interface where it wraps a native element.
- Import the css file: `import './<ComponentName>.css';`
- Import the classname helper: `import { cn } from '../utils/cn';`
- Icons: `lucide-react` (e.g. `import { Search } from 'lucide-react'`). Use the
  canonical icon mapping from the design spec §9 where one is named. Decorative
  icons get `aria-hidden="true"`; meaningful ones get an accessible label.

## CSS rules

- BEM-ish, prefixed `emenu-`: block `emenu-card`, element `emenu-card__title`,
  modifier `emenu-card--raised`.
- Use ONLY the CSS custom properties from `tokens.css` for color, spacing,
  radius, typography, elevation, z-index. Never hardcode hex/px that a token
  exists for.
- Focus: `:focus-visible { outline: none; box-shadow: var(--focus-ring); }`
- Respect `prefers-reduced-motion` for any non-trivial animation.

## Accessibility (mandatory — this is a WCAG 2.2 AA system)

- Real semantic elements (`button`, `nav`, `table`, `dialog`, etc.).
- State conveyed by more than color (icon/text/shape), per spec.
- Correct ARIA roles/labels; live regions for async/real-time updates.
- Touch targets ≥ 44×44px for interactive controls.
- Implement the "Accessibility" bullet points from each component's spec section.

## Stories rules

- `title: 'Components/<ComponentName>'`
- `import type { Meta, StoryObj } from '@storybook/react-vite';`
- `tags: ['autodocs']`
- Provide a default/primary story plus stories covering the key variants and
  states named in the spec. Use realistic restaurant/eMenu sample data
  (menu items, orders, tables, prices) — never lorem ipsum.

## Do NOT

- Do NOT edit `src/index.ts` — exports are wired centrally.
- Do NOT run builds or `nx` commands — they are verified centrally.
- Do NOT install packages.
- Do NOT reach into other components' folders; if you need a primitive that
  another component owns, assume it exists and import from its path
  (e.g. `import { Button } from '../Button/Button';`).
