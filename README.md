# GameShelf

A personal game tracker. Find games from the [RAWG](https://rawg.io) database, put them on your shelf, and keep track of what you're playing, what you've finished and what's next. Then share your profile with friends.

## What you can do

**Discover**
- Browse and search thousands of games, filter by genre, platform and release year, and sort the results
- Open any game for its description, screenshots, store links and other games in the same series
- See a Game of the Year showcase on the Discover page
- Press `/` anywhere to jump to the search bar

**Your shelf**
- Add a game with one click and give it a status: **Planned**, **Playing**, **Completed** or **Dropped**
- Rate it (1–5 stars), log your playtime and write private notes
- Start and finish dates are filled in for you when the status changes
- **Backlog**: drag your planned games into the order you want to play them. "Up Next" shows the top of the queue, and "What should I play?" picks a random one for you
- **Lists**: group games into your own collections, like "Couch co-op" or "Best soundtracks"

**Stats & sharing**
- A stats dashboard with totals, hours played, average rating, a status breakdown, a monthly completion chart and your top games
- **Year in Review**: what you finished in a given year, your favorites and your busiest months
- **Public profile** at `/u/<username>`. It's private until you switch it on, and your notes are never shown. The link gets a preview image when shared on social media
- Export your whole shelf as CSV or JSON

**Accounts**
- Sign up and log in with email and password
- Login and sign-up are rate limited to slow down password guessing and spam accounts

## Tech stack

| Area | Tools |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) (App Router, Server Actions, Cache Components) + React 19 |
| Auth | [Auth.js / NextAuth v5](https://authjs.dev) (credentials, JWT sessions, bcrypt) |
| Database | PostgreSQL + [Prisma 7](https://www.prisma.io) (`@prisma/adapter-pg`) |
| Styling | Tailwind CSS 4, Lucide icons |
| Validation | Zod |
| Testing | Vitest (unit + integration), Playwright (end-to-end) |

## Getting started

### 1. What you need

- **Node.js** 20.19 or newer
- **PostgreSQL**, running locally or hosted (Neon, Supabase, Railway, ...)
- A free **RAWG API key** from [rawg.io/apidocs](https://rawg.io/apidocs)

### 2. Install

```bash
git clone <this-repo-url>
cd GameShelf
npm install                # also generates the Prisma client
```

### 3. Configure

Copy the example env file and fill it in:

```bash
cp .env.example .env
```

| Variable | What it is |
| --- | --- |
| `DATABASE_URL` | Your PostgreSQL connection string, e.g. `postgresql://postgres:password@localhost:5432/gameshelf` |
| `AUTH_SECRET` | Random secret used to sign login sessions. Generate one with `npx auth secret` |
| `RAWG_API_KEY` | Your RAWG API key |
| `AUTH_TRUST_HOST` | Set to `true` when self-hosting with `next start` (not needed on Vercel) |

> Never commit your `.env` file. It's already in `.gitignore`.

### 4. Set up the database

```bash
npx prisma migrate deploy
```

This creates every table GameShelf needs.

### 5. Run it

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), create an account and start adding games.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run start` | Run the production build |
| `npm run lint` | Check the code with ESLint |
| `npm test` | Run unit and integration tests |
| `npm run test:unit` | Unit tests only (no database needed) |
| `npm run test:int` | Integration tests against a test database |
| `npm run test:e2e` | End-to-end browser tests with Playwright |
| `npx prisma migrate dev` | Create and apply a new migration after changing `prisma/schema.prisma` |
| `npx prisma studio` | Browse the database in your browser |

## Running the tests

Unit tests run straight away with `npm run test:unit`.

Integration and end-to-end tests need their own database, so your real data is never touched:

```bash
cp .env.test.example .env.test
```

Point `DATABASE_URL` in `.env.test` at a database whose name contains `_test` (for example `gameshelf_test`). The test setup creates and migrates it for you, and refuses to run against any other database. The end-to-end tests also call the real RAWG API, so fill in `RAWG_API_KEY` too.

Before your first E2E run, install the browser Playwright uses:

```bash
npx playwright install chromium
npm run test:e2e
```

## Project structure

```
prisma/
  schema.prisma      Database models: User, Shelf, ShelfList(Item), RateLimit
  migrations/        Database migrations
src/
  app/               Pages and API routes (App Router)
    games/           Discover and game detail pages
    shelf/           Your shelf, backlog and lists (+ Server Actions)
    dashboard/       Stats and Year in Review
    u/[username]/    Public profiles
    api/             Sign-up, Auth.js and shelf export endpoints
  auth.ts            Auth.js configuration
  proxy.ts           Redirects logged-out visitors away from private pages
  components/        UI components, grouped by feature
  services/          Database queries
  lib/               Prisma client, RAWG API client, rate limiter
  schemas/           Zod validation schemas
  constants/ hooks/ types/ utils/
tests/
  unit/              Fast tests for schemas and helpers
  integration/       Tests for services and actions against the test database
  e2e/               Playwright browser tests
```

## Credits

Game data and images come from the [RAWG Video Games Database API](https://rawg.io/apidocs).
