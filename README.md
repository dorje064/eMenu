# eMenu

An [Nx](https://nx.dev) monorepo for the **eMenu** digital restaurant platform.
It currently hosts the design-system component library and its Storybook.

## Requirements

- **Node ≥ 20.19** (CI/dev pinned to Node 22 — see `.nvmrc`). Modern Vite/Nx
  will not run on Node 16/18.
  ```sh
  nvm use        # picks up .nvmrc (22)
  npm install
  ```

## Projects

| Project  | Path      | Description                                                  |
| -------- | --------- | ------------------------------------------------------------ |
| `ui`     | `libs/ui` | React component library implementing the eMenu Design System |

## Component library — `@org/ui`

A React 19 + TypeScript component library built straight from
[`Docs/eMenuDesignSystem.md`](./Docs/eMenuDesignSystem.md). Design tokens
(`libs/ui/src/styles/tokens.css`) are CSS custom properties — colors,
typography, spacing, radius, elevation, z-index, plus dark-mode scaffolding.

**Components (19):** Button · Input · Search · Card · MenuItemCard ·
OrderStatusBadge · CategoryNavigation · Tabs · Modal · Drawer · Toast ·
DataTable · Pagination · DashboardCard · Avatar · EmptyState · LoadingState
(Skeleton/Spinner/ProgressBar) · Dropdown/Select · TableQRCard.

Authoring conventions for contributors live in
[`libs/ui/PATTERN.md`](./libs/ui/PATTERN.md).

```tsx
import { Button, MenuItemCard, OrderStatusBadge } from '@org/ui';
// Importing from '@org/ui' also applies the design tokens + base styles.
```

## Common commands

```sh
# Run Storybook (dev) for the component library
npx nx storybook ui

# Build a static Storybook site -> libs/ui/storybook-static
npx nx build-storybook ui

# Build the publishable library -> libs/ui/dist
npx nx build ui

# Type-check the library
npx nx typecheck ui

# Explore the workspace graph
npx nx graph
```

## Documentation

- [`Docs/eMenuRequirementsDocument.md`](./Docs/eMenuRequirementsDocument.md) — product requirements
- [`Docs/eMenuDesignSystem.md`](./Docs/eMenuDesignSystem.md) — design system spec (source of truth)
- [`Docs/eMenuUserFlows.md`](./Docs/eMenuUserFlows.md) · [`Docs/eMenuWireframes.md`](./Docs/eMenuWireframes.md)
