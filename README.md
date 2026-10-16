# GameShelf

GameShelf helps you explore popular games, view details, and keep track of what you play. Browse games from the [RAWG](https://rawg.io) database, add them to your shelf, set status, rating, playtime, and notes, then share a dashboard of your gaming stats.

## Features

- Browse and search games, plus a Game of the Year showcase
- Personal shelf with status (Planned, Playing, Completed, Dropped), rating, playtime, and caption
- Dashboard with charts and top games, shareable via a public link
- Sign in with email/password, GitHub, or Google

## Tech Stack

- [Next.js 16](https://nextjs.org) (App Router) + React 19
- [Auth.js / NextAuth v5](https://authjs.dev)
- [Prisma 7](https://www.prisma.io) + PostgreSQL (`@prisma/adapter-pg`)
- Tailwind CSS 4, Motion, Recharts, Zod

## Getting Started

### Prerequisites

- Node.js 20.19+
- PostgreSQL database
- RAWG API key, plus GitHub / Google OAuth credentials if you want social login

### Setup

```bash
npm install                # also runs `prisma generate`
cp .env.example .env       # then fill in the values
npx prisma migrate deploy  # apply database migrations
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For OAuth, set the callback URLs to:

- GitHub: `http://localhost:3000/api/auth/callback/github`
- Google: `http://localhost:3000/api/auth/callback/google`

## Environment Variables

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Secret for signing sessions (`npx auth secret`) |
| `RAWG_API_KEY` | API key from [rawg.io/apidocs](https://rawg.io/apidocs) |
| `GITHUB_ID` / `GITHUB_SECRET` | GitHub OAuth app credentials |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth client credentials |

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | Run ESLint |
| `npx prisma migrate dev` | Create/apply a migration during development |

## Project Structure

```
prisma/            Prisma schema and migrations
src/app/           Routes (pages and API handlers)
src/auth.ts        Auth.js configuration
src/components/    UI components
src/lib/           Prisma client and RAWG API helpers
src/services/      Database queries
src/schemas/       Zod schemas
src/generated/     Generated Prisma client (gitignored)
```
