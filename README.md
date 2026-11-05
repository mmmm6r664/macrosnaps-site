# MacroSnaps website

Next.js 15 site for MacroSnaps: global photography & videography for conferences, corporate events and weddings.

- 30 service pages with real MacroSnaps pricing (`src/lib/services.ts`).
- Local SEO pages: 10 services × (64 states/provinces + 1,826 cities), e.g. `/conference-photography/san-francisco-ca`. ~19,000 URLs; 3,230 pre-rendered, the rest render on first visit and are cached.
- Researched local venues/photo spots for the 132 largest cities (`src/data/local/`).
- Online booking + Stripe Checkout (`/book`), contact & corporate-quote forms via Resend.
- Schema.org, per-service sitemaps, robots.txt, 301s from old Wix URLs (`src/lib/redirects.ts`).

Edit: prices/copy `src/lib/services.ts` · business info `src/lib/site.ts` · city copy `src/lib/content.ts` · photos `src/lib/images.ts`.

Run: `cp .env.example .env.local`, fill keys, `npm install && npm run dev`. Deploy on Vercel with the same env vars.
