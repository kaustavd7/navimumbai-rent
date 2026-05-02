# navimumbai.rent

A crowdsourced, broker-free rent map for Navi Mumbai. Spiritual sibling of [bengaluru.rent](https://bengaluru.rent).

**Free forever. No signup. No ads. No data sold.**

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind v4
- MapLibre GL + MapTiler tiles
- Supabase (Postgres) for pins + reports
- Resend for the nightly match emails (Phase 2)
- Vercel for hosting

## Local dev

```bash
cp .env.example .env.local
# fill in Supabase + MapTiler keys
npm install
npm run dev
```

The site works without keys — it falls back to seeded pins and a demo map style — so you can see the UI immediately.

## Database setup

Once you have a Supabase project:

1. Open the SQL editor.
2. Paste and run [`supabase/schema.sql`](./supabase/schema.sql).
3. Drop the project URL, anon key, and service-role key into `.env.local`.

## Project layout

```
src/
  app/
    page.tsx                  map + sidebar shell
    layout.tsx                fonts, metadata
    faq/page.tsx
    stats/page.tsx
    api/pins/route.ts         POST new pin (rate-limited, validated)
    api/pins/[id]/report/route.ts
  components/
    MapView.tsx               MapLibre client component
    Sidebar.tsx               filters + live stats
    PinDialog.tsx             drop-pin form
  lib/
    nodes.ts                  Navi Mumbai CIDCO nodes
    seed.ts                   placeholder pins for empty DB
    supabase.ts               browser client
    types.ts
supabase/schema.sql           DDL + RLS + public view
public/brand/                 logo assets
```

## Roadmap

- **Phase 1 (this commit):** map, drop-pin, filters, sidebar stats, FAQ.
- **Phase 2:** nightly matcher cron + Resend emails, report flow polish, seeker expiry.
- **Phase 3:** metro + harbour line overlays, sector autocomplete, area-stats rectangle, per-node SEO pages, green-cover Sentinel-2 toggle.
- **Phase 4:** compare-nodes view, dark mode polish, bottom-sheet on mobile, OG images per node, Plausible.

## A note on the domain

The domain `navimumbai.rent` itself is also up for sale. If you want to take this further or run something else on the address, email **kaustavdg.dasgupta@gmail.com**.

> BHK: 1 domain. Rent: negotiable. Available.
