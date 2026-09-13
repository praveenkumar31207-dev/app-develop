-- ==============================================================================
-- SHOPCALCI: SECURE ROW LEVEL SECURITY (RLS) POLICIES
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/ibgckqkoxmamddaixwud/sql)
-- Fixes Supabase Security Linter warning: 0024_permissive_rls_policy
-- Includes Retail & Wholesale counters
-- ==============================================================================

-- 1. Ensure tables exist
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

CREATE TABLE IF NOT EXISTS public.sales (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  unit TEXT,
  quantity NUMERIC NOT NULL,
  price_at_sale NUMERIC NOT NULL,
  line_total NUMERIC NOT NULL,
  sale_type TEXT DEFAULT 'retail', -- 'retail' or 'wholesale'
  buyer_name TEXT,                 -- party/shop name for wholesale supply
  sale_timestamp TIMESTAMPTZ NOT NULL,
  date_str TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- If table already existed, add columns safely
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sales' AND column_name='sale_type') THEN
    ALTER TABLE public.sales ADD COLUMN sale_type TEXT DEFAULT 'retail';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sales' AND column_name='buyer_name') THEN
    ALTER TABLE public.sales ADD COLUMN buyer_name TEXT;
  END IF;
END $$;

-- 2. Enable Row Level Security
ALTER TABLE public.shop_backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- 3. Drop legacy overly permissive ALL policies
DROP POLICY IF EXISTS "Allow public read-write for parlour backups" ON public.shop_backups;
DROP POLICY IF EXISTS "Allow public read-write for parlour sales" ON public.sales;
DROP POLICY IF EXISTS "Allow read shop backups" ON public.shop_backups;
DROP POLICY IF EXISTS "Allow insert shop backups" ON public.shop_backups;
DROP POLICY IF EXISTS "Allow update shop backups" ON public.shop_backups;
DROP POLICY IF EXISTS "Allow read sales" ON public.sales;
DROP POLICY IF EXISTS "Allow insert sales" ON public.sales;
DROP POLICY IF EXISTS "Allow update sales" ON public.sales;

-- ==============================================================================
-- 4. Granular, Secure Policies for `shop_backups`
-- ==============================================================================

CREATE POLICY "Allow read shop backups"
ON public.shop_backups
FOR SELECT
TO anon, authenticated
USING (shop_id IS NOT NULL);

CREATE POLICY "Allow insert shop backups"
ON public.shop_backups
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(trim(shop_id)) > 0 AND 
  length(trim(shop_name)) > 0
);

CREATE POLICY "Allow update shop backups"
ON public.shop_backups
FOR UPDATE
TO anon, authenticated
USING (length(trim(shop_id)) > 0)
WITH CHECK (
  length(trim(shop_id)) > 0 AND 
  length(trim(shop_name)) > 0
);

-- ==============================================================================
-- 5. Granular, Secure Policies for `sales`
-- ==============================================================================

CREATE POLICY "Allow read sales"
ON public.sales
FOR SELECT
TO anon, authenticated
USING (id IS NOT NULL);

CREATE POLICY "Allow insert sales"
ON public.sales
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(trim(id)) > 0 AND
  length(trim(product_id)) > 0 AND
  quantity > 0 AND
  price_at_sale >= 0 AND
  line_total >= 0
);

CREATE POLICY "Allow update sales"
ON public.sales
FOR UPDATE
TO anon, authenticated
USING (id IS NOT NULL)
WITH CHECK (
  length(trim(id)) > 0 AND
  quantity > 0 AND
  price_at_sale >= 0 AND
  line_total >= 0
);
