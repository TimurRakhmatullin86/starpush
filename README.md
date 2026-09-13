# ★ StarPush

**Automated Google review collection for local businesses — starting at $19/month.**

Birdeye costs $349/mo. Podium costs $399+. StarPush gives plumbers, dentists, barbers, and auto shops the same review automation for 18x less.

## How It Works

```
Customer visits your business
        ↓
Gets SMS 1-2 hours later: "How was your visit?"
        ↓
   ┌────┴────┐
 4-5 ★       1-3 ★
   ↓           ↓
→ Google    → Private feedback
  Review      to business owner
```

**Happy customers** get directed to leave a Google review (1-click link).  
**Unhappy customers** send feedback directly to you — it never reaches Google.

## Features

- **SMS Review Requests** — Send via Twilio with customizable templates
- **Smart Routing** — 4-5 stars → Google, 1-3 stars → private inbox
- **Mobile Landing Page** — Sub-second load, tap-to-rate, zero friction
- **Analytics Dashboard** — Sent/opened/reviewed/feedback + NPS score
- **Bulk CSV Import** — Upload customer lists for mass outreach
- **Google Places Integration** — Auto-generate review links
- **Stripe Billing** — Free/Starter($19)/Growth($39)/Pro($69) tiers
- **Opt-out Compliance** — Customers can reply STOP to unsubscribe

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** NextAuth.js (email/password)
- **SMS:** Twilio
- **Payments:** Stripe
- **Places:** Google Places API

## Quick Start

```bash
# Clone and install
git clone https://github.com/timurua/starpush.git
cd starpush
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Set up database
npx prisma generate
npx prisma db push

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Random secret for JWT signing |
| `NEXTAUTH_URL` | App URL (http://localhost:3000 for dev) |
| `TWILIO_ACCOUNT_SID` | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Twilio auth token |
| `TWILIO_PHONE_NUMBER` | Twilio phone number for sending |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_STARTER_PRICE_ID` | Stripe price ID for Starter plan |
| `STRIPE_GROWTH_PRICE_ID` | Stripe price ID for Growth plan |
| `STRIPE_PRO_PRICE_ID` | Stripe price ID for Pro plan |
| `GOOGLE_PLACES_API_KEY` | Google Places API key |

## Project Structure

```
src/
├── app/
│   ├── (auth)/login, register     # Auth pages
│   ├── (dashboard)/               # Owner dashboard
│   │   ├── overview/              # Stats overview
│   │   ├── reviews/               # Positive reviews list
│   │   ├── feedback/              # Negative feedback inbox
│   │   ├── send/                  # Send SMS (single + bulk CSV)
│   │   ├── analytics/             # Funnel + NPS
│   │   ├── settings/              # Business config + Places search
│   │   └── billing/               # Stripe plans
│   ├── r/[id]/                    # Customer review landing page
│   └── api/                       # All API routes
├── components/
│   ├── dashboard/                 # Sidebar, header, stat cards
│   └── review-page/              # Star rating, landing page
└── lib/                           # Twilio, Stripe, Prisma, Google Places
```

## Pricing

| Plan | Price | SMS/month | Locations |
|---|---|---|---|
| Free | $0 | 10 | 1 |
| Starter | $19 | 100 | 1 |
| Growth | $39 | 500 | 3 |
| Pro | $69 | Unlimited | Unlimited |

## License

MIT
