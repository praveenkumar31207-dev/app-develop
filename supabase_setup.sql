-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/ibgckqkoxmamddaixwud/sql)

-- 1. Table for full offline snapshot backups
CREATE TABLE IF NOT EXISTS public.shop_backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id TEXT UNIQUE NOT NULL DEFAULT 'default-shop',
  shop_name TEXT NOT NULL,
  franchise_brand TEXT,
  total_products INTEGER DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  products_data JSONB DEFAULT '[]'::jsonb,
  sales_data JSONB DEFAULT '[]'::jsonb,
  profile_data JSONB DEFAULT '{}'::jsonb,
  synced_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Table for granular sales queries (optional / analytical)
CREATE TABLE IF NOT EXISTS public.sales (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  unit TEXT,
  quantity NUMERIC NOT NULL,
  price_at_sale NUMERIC NOT NULL,
  line_total NUMERIC NOT NULL,
  sale_timestamp TIMESTAMPTZ NOT NULL,
  date_str TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable RLS and public policies for parlour counter access
ALTER TABLE public.shop_backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- Allow anon read/write for parlour devices
CREATE POLICY "Allow public read-write for parlour backups" 
ON public.shop_backups 
FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow public read-write for parlour sales" 
ON public.sales 
FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);
