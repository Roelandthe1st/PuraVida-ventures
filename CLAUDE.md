# Pura Vida Dashboard

Portfolio dashboard voor het bijhouden van beleggingsfondsen, transacties en prestaties.

## Tech Stack

| Laag | Technologie |
|------|-------------|
| Framework | [Next.js 15](https://nextjs.org/) (App Router) |
| Taal | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 — donker kleurenschema |
| Database | [Supabase](https://supabase.com/) (PostgreSQL + realtime) |
| Grafieken | [Recharts](https://recharts.org/) |
| Icons | [Lucide React](https://lucide.dev/) |
| Utilities | clsx + tailwind-merge, Intl API |

## Mappenstructuur

```
pura-vida-dashboard/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout met Sidebar
│   ├── page.tsx            # Redirect → /overview
│   ├── globals.css         # Tailwind + donker thema basisstijlen
│   ├── overview/           # Portfolio overzicht (stats, grafieken)
│   ├── transactions/       # Transactiehistorie + toevoegen
│   ├── fund-info/          # Fondskaarten (ISIN, TER, categorie)
│   ├── reports/            # Rapport generatie
│   └── settings/           # Supabase-verbinding & voorkeuren
│
├── components/
│   ├── layout/
│   │   └── Sidebar.tsx     # Navigatiezijbalk
│   ├── ui/
│   │   ├── StatCard.tsx    # KPI-kaartje (label, waarde, verandering)
│   │   ├── PageHeader.tsx  # Paginatitel + optionele acties
│   │   └── Badge.tsx       # Statuslabels (success/danger/warning)
│   └── charts/             # Recharts-wrappers (te bouwen)
│
├── lib/
│   ├── supabase.ts         # Supabase client + getransactions/getFunds
│   ├── api.ts              # Externe marktdata API-wrapper
│   └── utils.ts            # cn(), formatCurrency(), formatDate(), formatPercent()
│
├── public/                 # Statische bestanden
├── .env.local.example      # Voorbeeld omgevingsvariabelen
└── CLAUDE.md               # Dit bestand
```

## Kleurenschema (donker)

| Token | Hex | Gebruik |
|-------|-----|---------|
| `background.DEFAULT` | `#0f1117` | Pagina-achtergrond |
| `background.secondary` | `#1a1d27` | Zijbalk |
| `background.card` | `#1e2130` | Kaarten |
| `border` | `#2a2d3e` | Randen |
| `accent` | `#6366f1` | Actieve navigatie, knoppen |
| `success` | `#10b981` | Positieve waarden |
| `danger` | `#ef4444` | Negatieve waarden |
| `text-primary` | `#f1f5f9` | Hoofdtekst |
| `text-secondary` | `#94a3b8` | Subtitels, labels |
| `text-muted` | `#475569` | Plaatshouders, uitgeschakeld |

## Aan de slag

```bash
# 1. Installeer dependencies
npm install

# 2. Maak je omgevingsvariabelen aan
cp .env.local.example .env.local
# Vul NEXT_PUBLIC_SUPABASE_URL en NEXT_PUBLIC_SUPABASE_ANON_KEY in

# 3. Start de ontwikkelserver
npm run dev
```

## Supabase Schema (minimaal)

```sql
-- Fondsen
create table funds (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  isin text,
  ticker text,
  currency text not null default 'EUR',
  ter numeric(5,4),
  category text,
  description text
);

-- Transacties
create table transactions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  date date not null,
  fund_id uuid references funds(id),
  type text check (type in ('buy','sell','dividend','transfer')),
  units numeric(18,8) not null,
  price numeric(18,4) not null,
  amount numeric(18,2) not null,
  currency text not null default 'EUR',
  notes text
);
```

## Conventies

- Componenten: PascalCase, één component per bestand
- Utility-functies: camelCase in `lib/`
- Pagina-bestanden: altijd `page.tsx` in de juiste app-map
- Stijlen: Tailwind utility-klassen — geen losse CSS-bestanden buiten `globals.css`
- Geen `any` in TypeScript tenzij onvermijdelijk
