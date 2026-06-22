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

| Project  | Path       | Description                                                  |
| -------- | ---------- | ------------------------------------------------------------ |
| `ui`     | `libs/ui`  | React component library implementing the eMenu Design System |
| `api`    | `apps/api` | NestJS REST API (customer auth + menu management)            |

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

## API — `apps/api` (NestJS)

A NestJS REST API with JWT auth, TypeORM + SQLite persistence (no external DB
server — a local `emenu.sqlite` file is auto-created), `class-validator` request
validation, and Swagger docs.

```sh
cp apps/api/.env.example apps/api/.env   # optional; sensible dev defaults exist
npx nx serve api                         # http://localhost:3000/api
# Swagger UI:   http://localhost:3000/api/docs
# OpenAPI JSON: http://localhost:3000/api/docs-json
```

### Endpoints

| Method | Path                  | Auth   | Description                          |
| ------ | --------------------- | ------ | ------------------------------------ |
| POST   | `/api/auth/signup`    | public | Register a customer, returns a JWT   |
| POST   | `/api/auth/login`     | public | Log in, returns a JWT                |
| GET    | `/api/auth/me`        | Bearer | Current authenticated customer       |
| POST   | `/api/menu/items`     | Bearer | Add a food item to the menu          |
| GET    | `/api/menu/items`     | public | List items (optional `?category=`)   |
| GET    | `/api/menu/items/:id` | public | Get one item                         |

```sh
# Quick smoke test
TOKEN=$(curl -s -X POST localhost:3000/api/auth/signup -H 'Content-Type: application/json' \
  -d '{"email":"diner@example.com","password":"S3curePass!","fullName":"Asha"}' | npx --yes json accessToken)
curl -X POST localhost:3000/api/menu/items -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Margherita Pizza","category":"Mains","price":12.5,"prepTimeMinutes":15}'
```

> Note: `synchronize: true` is enabled for dev convenience (auto-creates the
> schema). Switch to TypeORM migrations before production, and set a real
> `JWT_SECRET`.

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
