# College OS — Kelley Command Center

A standalone command-center web app for managing classes, assignments, tasks,
finance/news, and daily planning — themed for an Indiana University Kelley
School of Business student. Built to run entirely on free infrastructure.

## 1. Technology used

- **Next.js 14** (App Router) + **TypeScript** — one app, pages + API routes together.
- **Tailwind CSS** — styling, with an IU/Kelley color theme (crimson / cream / charcoal) configured in `tailwind.config.ts`.
- **Browser `localStorage`** — all your data (assignments, tasks, classes, watchlist, chat) is stored on your own device. No database, no signup, free forever.
- **Free, keyless data sources at runtime:**
  - News: public RSS feeds (CNBC, MarketWatch, TechCrunch, Federal Reserve) via a server route that fetches and merges them.
  - Stock quotes: [Stooq](https://stooq.com)'s free, unauthenticated quote endpoint.
- **Optional, opt-in AI** via the Anthropic API — only activates if you add your own `ANTHROPIC_API_KEY`. Both the AI Assistant and the news "why should I care" summaries work today with a **free, built-in rule-based engine** and get smarter automatically if you add a key later.
- **lucide-react** for icons, **date-fns** for date math, **rss-parser** for reading RSS feeds.

## 2. Project files

```
college-os/
  app/
    page.tsx                Home dashboard
    calendar/page.tsx        Day/week calendar (read-only, sample events)
    assignments/page.tsx     Assignment CRUD + priority grouping
    tasks/page.tsx           Task CRUD, categories, recurrence
    classes/page.tsx         Class manager + syllabus date scanner
    finance/page.tsx         Watchlist, index snapshot, AI finance chat
    news/page.tsx            Categorized news + AI "why should I care"
    study/page.tsx           Exam study plan generator
    assistant/page.tsx       General AI assistant chat
    settings/page.tsx        Profile, integration status, data reset
    api/news/route.ts        RSS aggregation (server-side, cached 5 min)
    api/stocks/route.ts      Stooq quote proxy (server-side, cached 1 min)
    api/summarize/route.ts   Optional Anthropic-powered news summaries
    api/status/route.ts      Reports which optional integrations are on
    layout.tsx, globals.css  Fonts, theme, shell
  components/                Sidebar/shell + shared UI (Card, Badge, Modal)
  lib/                       Types, localStorage store, priority engine,
                              rule-based assistants, study planner, syllabus
                              date scanner, sample seed data
  package.json, tsconfig.json, tailwind.config.ts, next.config.mjs, postcss.config.js
  .env.example               All variables are optional — see below
```

## 3. Deploying to Vercel

1. Create a new GitHub repo and push this folder's contents to it (or drag-and-drop the folder into a fresh repo).
2. Go to [vercel.com/new](https://vercel.com/new), import that repo. Vercel auto-detects Next.js — no config changes needed.
3. Leave Environment Variables empty for now and click **Deploy**. The app builds and works immediately with sample data, free news, and free stock quotes.
4. (Optional, later) In your Vercel project → **Settings → Environment Variables**, add any of the variables from `.env.example`, then redeploy. Never paste real keys into a chat with an AI assistant — only into Vercel's dashboard or a local `.env.local` file (already git-ignored).

For local development: `npm install`, then `npm run dev`, and open `http://localhost:3000`.

## 4. What works immediately (zero setup)

- The full IU/Kelley-themed dashboard, sidebar, and all 10 pages.
- Add/edit/delete/complete for Assignments, Tasks, Classes, and Study plans — saved to your browser's local storage.
- The priority engine and the "What should I do?" recommendation on Home.
- The Calendar (day/week views) with clearly-labeled sample events.
- Live business/finance news (RSS) and live-ish stock quotes (Stooq) — these need internet access at runtime but no account or key.
- The AI Assistant and AI Finance Assistant, answering the questions in the spec (what's due, priorities, conflicts, free time, market briefing, etc.) using a free rule-based engine over your real dashboard data.
- The syllabus tool: paste or upload a `.txt` file and scan it for dates.

## 5. What requires an API key or account connection

- **Smarter AI Assistant + AI news summaries**: add `ANTHROPIC_API_KEY` in Vercel's environment variables. Without it, both features already work using the built-in rule-based engine — the key just upgrades the news summaries and lets the assistant handle more open-ended questions.
- **Google Calendar sync (read-only)**: this is Stage 2. You'll need to create a free OAuth client in [Google Cloud Console](https://console.cloud.google.com/), restrict it to the read-only Calendar scope, and add `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` in Vercel. The Settings page shows connection status once those are set; wiring the actual OAuth consent flow (e.g. with `next-auth`) is the next coding step — see section 7.

## 6. What's limited by free services

- **Stock quotes**: Stooq is free and needs no key, but it only gives today's open/close — the "% change" shown is `(close − open)`, not a true previous-close change. For accurate real-time data, swap in a free-tier key from Finnhub or Alpha Vantage in `app/api/stocks/route.ts`.
- **Earnings / IPO / M&A calendars**: no free, keyless API provides these cleanly, so the Finance page shows related free headlines instead of a dedicated calendar.
- **Syllabus upload**: accepts pasted text or `.txt` files today. PDF/Word parsing needs either a parsing library added to the project or a paid OCR API — a good Stage 2/3 addition.
- **News feed IDs**: a couple of the CNBC RSS feed URLs in `app/api/news/route.ts` were selected from memory and may occasionally 404 if CNBC changes them; the route already tolerates individual feed failures (`Promise.allSettled`), so the page keeps working with whichever feeds succeed. Swap URLs in that one file if you notice a gap.

## 7. Recommended next steps

1. Wire real Google Calendar OAuth (read-only) using `next-auth` + the Google provider, replacing the sample calendar events.
2. Add a small database (Vercel Postgres or Vercel KV both have free tiers) if you want your data to sync across devices instead of living in one browser's local storage.
3. Add PDF syllabus parsing (e.g. `pdf-parse` in a server route) so you can upload the real PDF instead of pasting text.
4. Upgrade stock data to a free-tier keyed provider (Finnhub/Alpha Vantage) for accurate previous-close change and company profiles.
5. Add browser/email/push alerts for due-today and overdue items — Version 1 shows alerts in-app only, per the brief.
