# syntax=docker/dockerfile:1

# ---- deps: Linux node_modules + generated Prisma client, shared by every stage below ----
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
# postinstall runs `prisma generate`, which only reads the schema; this URL is never connected to
RUN DATABASE_URL=postgresql://build:build@localhost:5432/build npm ci

# ---- dev: `next dev` with hot reload; also runs the tests and the Prisma CLI ----
FROM deps AS dev
ENV NEXT_TELEMETRY_DISABLED=1
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# ---- migrate: applies pending migrations, then exits ----
FROM deps AS migrate
CMD ["npx", "prisma", "migrate", "deploy"]

# ---- build: production build with standalone output ----
FROM deps AS build
ENV NEXT_TELEMETRY_DISABLED=1 BUILD_STANDALONE=1
# NEXT_PUBLIC_* values are baked into the bundle at build time
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
COPY . .
RUN DATABASE_URL=postgresql://build:build@localhost:5432/build npm run build

# ---- runner: the production image, only what `node server.js` needs ----
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0 PORT=3000
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
USER node
EXPOSE 3000
CMD ["node", "server.js"]
