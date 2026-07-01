# syntax=docker/dockerfile:1

# eMenu API — NestJS app built with Nx + webpack.
#
# The webpack bundle (apps/api/dist/main.js) keeps all npm packages EXTERNAL
# (they are `require()`d at runtime), so node_modules must ship with the image.
#
# Build from the WORKSPACE ROOT so the full monorepo is in context:
#   docker build -f apps/api/Dockerfile -t emenu-api .

# ---------------------------------------------------------------------------
# Stage 1 — build the bundle with the full (dev) dependency tree.
# ---------------------------------------------------------------------------
FROM node:22-alpine AS builder

# pnpm via corepack; lockfile is v6 → pnpm 8.
RUN corepack enable && corepack prepare pnpm@8 --activate

WORKDIR /app

# Install deps first for better layer caching. The root manifest is the only
# one that matters (no pnpm-workspace.yaml), but copy the api manifest too.
COPY package.json pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/package.json
RUN pnpm install --frozen-lockfile

# Copy the rest of the workspace and build only the api project.
COPY . .
RUN pnpm nx build api --configuration=production

# ---------------------------------------------------------------------------
# Stage 2 — lean runtime image.
# ---------------------------------------------------------------------------
FROM node:22-alpine AS runner

ENV NODE_ENV=production \
    PORT=3000

WORKDIR /app

# Resolved dependency tree from the builder. tslib is required by the bundle
# but only classified as a dev/api dependency at the root, so a --prod install
# would drop it — copying the built tree avoids that footgun.
COPY --from=builder /app/node_modules ./node_modules

# Root manifest (its "start" script + metadata) and the compiled bundle.
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Uploaded images land in <cwd>/apps/api/uploads (see upload.constants.ts).
# Mount a volume here so user content survives container restarts.
RUN mkdir -p apps/api/uploads && chown -R node:node /app
VOLUME ["/app/apps/api/uploads"]

USER node
EXPOSE 3000

# cwd must be the workspace root so UPLOAD_DIR resolves to apps/api/uploads.
CMD ["node", "apps/api/dist/main.js"]
