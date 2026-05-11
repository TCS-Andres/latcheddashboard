# Latched Beginnings — Marketing Dashboard

A fractional-CMO dashboard for **Latched Beginnings**, Dr. Kacie Culotta's
specialized dental & lactation practice in Austin, TX.

Built from the Universal Dashboard Prompt and Latched Beginnings master brain.

---

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
```

Node 18+ recommended.

---

## What's in here

- **Executive Overview** — KPI strip, revenue+consultations trend, signals, funnel, source mix
- **Family Acquisition** — monthly consults, source mix over time, releases performed
- **Revenue & Financials** — monthly revenue, MTD pacing tiles, revenue by source, ACV trend
- **Social Media** — Instagram + Facebook channel switcher, follower & engagement trends, top posts (aggregated), ManyChat + lead-magnet trends
- **Paid Ads** — Meta-only for MVP, campaign table with CPI/ROAS, spend trend
- **Strategy & Notes** — local marketing journal with tags
- **Data** — targets + monthly actuals editor with pagination

A topbar "Targets" button opens a quick-edit dialog for the current
monthly targets, used everywhere the dashboard says "target."

---

## Privacy posture (important)

The practice is **HIPAA-adjacent** (healthcare, infants, parent records).
The dashboard is therefore **aggregation-only**:

- No names, contact info, or per-family identifiers anywhere.
- Local storage holds only operational aggregates (targets, actuals, marketing notes).
- Anywhere a record-level workflow is needed, the UI deep-links to **ClientSecure**
  (the practice management system) — see the "View leads in ClientSecure" CTA
  on the Paid Ads tab and the sidebar link.

When real integrations land, all aggregation must happen **upstream** — the
browser never receives PHI.

---

## Vocabulary

Decided during build (overridable in `src/config/clients/latched-beginnings.ts`):

| Concept       | Term used         |
|---------------|-------------------|
| Unit of care  | Family            |
| Top of funnel | Inquiry           |
| Conversion    | Consultation (Booked) |
| Procedure     | Release           |

The decision-maker is the parent (typically the mother), but the unit of care
is the **family**. "Patient" was deliberately avoided to keep the focus on the
decision-making audience.

---

## Tech stack

- Vite + React 18 + TypeScript
- Tailwind CSS (custom coral pink brand palette)
- Radix UI primitives (Dialog, Tabs, Popover) — shadcn-style locally vendored
- Recharts for all charts
- React Router v6
- Lucide icons
- DM Serif Display (display) + Inter (body) from Google Fonts
- `localStorage` for targets, monthly actuals, target overrides, notes, theme

No backend, no auth, no APIs in MVP — all data is mocked from a seeded PRNG so
numbers are stable within a window but believable for a specialty practice.

---

## File layout

```
src/
├── App.tsx                       routes
├── main.tsx
├── index.css                     Tailwind + brand tokens
├── components/
│   ├── KpiCard.tsx               KPI card with sparkline + delta
│   ├── SectionCard.tsx           card chrome
│   ├── PageHeader.tsx
│   ├── Logo.tsx                  LB wordmark + mark
│   ├── DateRangePicker.tsx
│   ├── QuickTargetsDialog.tsx
│   ├── layout/
│   │   ├── AppLayout.tsx
│   │   ├── Sidebar.tsx
│   │   └── Topbar.tsx
│   └── ui/                       Card, Button, Badge, Input, Tabs, Dialog, Skeleton
├── config/
│   └── clients/
│       ├── index.ts              activeClient resolver
│       ├── types.ts
│       └── latched-beginnings.ts client identity, vocab, brand, targets
├── lib/
│   ├── utils.ts                  cn, format helpers, seeded PRNG
│   ├── store/
│   │   ├── targets.ts            useTargets / useActuals / overlay
│   │   ├── notes.ts              useNotes
│   │   └── theme.ts              useTheme (light/dark)
│   └── data/
│       ├── index.ts              barrel
│       ├── types.ts
│       ├── mockUtils.ts          seeded series generator
│       ├── mockFamilies.ts
│       ├── mockRevenue.ts
│       ├── mockAds.ts
│       ├── mockSocial.ts
│       └── mockReviews.ts
├── hooks/
│   └── useAsyncData.ts
└── pages/
    ├── ExecutiveOverview.tsx
    ├── Acquisition.tsx
    ├── Revenue.tsx
    ├── Social.tsx
    ├── Ads.tsx
    ├── Notes.tsx
    └── Data.tsx
```

---

## Wiring real integrations later

Per the universal prompt's data layer story: every page imports from
`@/lib/data`. Each `mock<Source>.ts` file exposes the function signature the
real API will eventually have. To wire real data:

1. Replace the body of e.g. `fetchCampaigns()` in `mockAds.ts` with a real
   Meta Marketing API call.
2. Pages don't change.

Suggested first integrations (per the master brain priorities):

- **Instagram + Facebook** (Meta Graph API) — replace `mockSocial.ts`
- **ManyChat** — webhook → aggregated counts; replace `fetchManychatEngagement`
- **ClientSecure** — replace `fetchConsultationsMonthly`, `fetchProceduresMonthly`
  (aggregated counts only — no per-record data into the dashboard)
- **Google Reviews / GBP** — replace `mockReviews.ts`
- **Google Analytics 4** — replace `fetchAcquisitionFunnel` reach + engagement
- **Quiz funnel** (custom backend) — aggregated completion counts
- **Meta Ads** — `fetchCampaigns`, `fetchAdSpendMonthly`, `fetchAdInquiriesMonthly`

---

## Assumptions to confirm with Dr. Culotta / Andres

These were inferred from the master brain rather than confirmed live. Adjust in
`src/config/clients/latched-beginnings.ts` and the targets dialog:

1. **Unit-of-care term** — "Family" (decision-maker = parent; unit of care = baby).
   If the practice prefers "Family/Mom" or "Patient family" pair, change `vocabulary.customer`.
2. **Average case value** — defaulted to **$2,400** (consultation + CO2 laser release + post-op).
   Update `DEFAULT_AVERAGE_CASE_VALUE` in `mockRevenue.ts` and the per-month
   actuals once real numbers arrive.
3. **Monthly revenue target** — defaulted to **$45,000** as a plausible band for
   a high-quality specialty cash-pay practice doing ~18 releases/month. Real
   target should be entered in the Targets dialog.
4. **Funnel stage names** — modeled as: Reach → Engaged Sessions → Inquiries →
   Consults Booked → Consults Attended → Releases Performed.
5. **CRM deep-link** — placeholder `https://app.clientsecure.com`. Replace with
   real org URL in `privacy.crmDeepLink`.
6. **Provider coaching B2B revenue** — currently rolled into "Other" in source
   mix. If it becomes a meaningful revenue line, break it out as its own
   acquisition source and revenue category.

---

## Known issues / next steps

- The date-range picker is UI-only in MVP — all data is shown over a fixed
  trailing-12-month window. Wire through once real APIs land.
- Bundle size warning (Recharts is large). Code-split per-route if it becomes
  a concern.
- "Signals" panel is hardcoded for MVP — derive from data later (per the
  universal prompt's recommendation).
- Provider coaching is not yet a dedicated revenue category — flag it in the
  Data tab's per-month actuals if it grows.

---

Prepared by **The Creative Strategist** | Andres Diaz | Fractional CMO & Marketing Agency
