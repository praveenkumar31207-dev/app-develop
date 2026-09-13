# ShopCalci — Dairy Parlour Sales Tracker & Counter POS

A lightweight, mobile-first, offline-ready web application designed for retail dairy parlours (modeled on a Tirumala Milk franchise in Chennai) to replace manual sales notebook entries with instant auto-calculations, daily and monthly trend graphs, and automatic Supabase cloud backup.

## Features

- **Offline-First**: All products and sales entries are persisted on-device in browser local storage. Works with zero internet dependency.
- **High-Speed Counter Entry**: Large steppers (`-`, `+`), number keypad input, and quick multiplier buttons (`+1`, `+2`, `+5`, `+10`) for rapid entry during counter rush.
- **Automatic Sales Aggregations**: Instant computation of line totals (`Quantity × Price`), daily revenue, and monthly aggregates.
- **Visual Analytics**: Interactive Recharts graphs for **Daily Trends** (last 7, 14, or 30 days) and **Monthly Trends** (last 6 months) with tap-to-inspect drilldown.
- **Historical Price Protection**: Modifying a product's price in the catalogue does not alter previously recorded historical sales.
- **Supabase Cloud Sync**: Automatically creates cloud backup snapshots whenever the device is online.
- **Spreadsheet Exports**: One-click download of all sales records as CSV/Excel.
- **Preloaded Chennai Dairy Catalogue**: Toned Milk, Standard Milk, Full Cream Milk, Curd, Buttermilk (Moru), Lassi, Flavoured Milk, Pure Cow Ghee, Paneer, and Ice Cream.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **Database & Cloud Backup**: Supabase PostgreSQL & Client-side Persistent Storage

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://ibgckqkoxmamddaixwud.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the counter dashboard.
