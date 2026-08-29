-- Patch shop_products / shop_orders if tables were created manually without all columns.
-- Safe to run multiple times in Supabase SQL Editor.

alter table public.shop_products add column if not exists short_description text;
alter table public.shop_products add column if not exists description text;
alter table public.shop_products add column if not exists price_pence integer;
alter table public.shop_products add column if not exists sale_price_pence integer;
alter table public.shop_products add column if not exists product_type text;
alter table public.shop_products add column if not exists level text;
alter table public.shop_products add column if not exists subject text;
alter table public.shop_products add column if not exists exam_board text;
alter table public.shop_products add column if not exists product_kind text not null default 'digital';
alter table public.shop_products add column if not exists stock_quantity integer;
alter table public.shop_products add column if not exists is_featured boolean not null default false;
alter table public.shop_products add column if not exists is_published boolean not null default false;
alter table public.shop_products add column if not exists image_path text;
alter table public.shop_products add column if not exists preview_path text;
alter table public.shop_products add column if not exists download_path text;
alter table public.shop_products add column if not exists keywords text;
alter table public.shop_products add column if not exists sort_order integer not null default 0;
alter table public.shop_products add column if not exists created_at timestamptz not null default now();
alter table public.shop_products add column if not exists updated_at timestamptz not null default now();

alter table public.shop_orders add column if not exists stripe_session_id text;
alter table public.shop_orders add column if not exists customer_name text;
alter table public.shop_orders add column if not exists shipping_name text;
alter table public.shop_orders add column if not exists shipping_line1 text;
alter table public.shop_orders add column if not exists shipping_line2 text;
alter table public.shop_orders add column if not exists shipping_city text;
alter table public.shop_orders add column if not exists shipping_postcode text;
alter table public.shop_orders add column if not exists shipping_country text default 'GB';
alter table public.shop_orders add column if not exists shipping_phone text;
alter table public.shop_orders add column if not exists items jsonb not null default '[]'::jsonb;
alter table public.shop_orders add column if not exists subtotal_pence integer not null default 0;
alter table public.shop_orders add column if not exists total_pence integer not null default 0;
alter table public.shop_orders add column if not exists payment_status text not null default 'pending';
alter table public.shop_orders add column if not exists has_physical boolean not null default false;
alter table public.shop_orders add column if not exists has_digital boolean not null default false;
alter table public.shop_orders add column if not exists created_at timestamptz not null default now();
alter table public.shop_orders add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'shop_products_product_kind_check'
  ) then
    alter table public.shop_products
      add constraint shop_products_product_kind_check
      check (product_kind in ('digital', 'physical'));
  end if;
end $$;

-- Reload PostgREST schema cache after structural changes (Supabase Dashboard → Settings → API → Reload schema).
