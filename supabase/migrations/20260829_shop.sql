-- JD Science shop: products and orders.
-- Run in the Supabase SQL editor, then create a private Storage bucket named
-- "shop-products" (images/ and previews/ can be made public via signed URLs;
-- downloads/ must stay private).

create table if not exists public.shop_products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  short_description text,
  description text,
  price_pence integer not null check (price_pence >= 0),
  sale_price_pence integer check (sale_price_pence is null or sale_price_pence >= 0),
  product_type text not null,
  level text,
  subject text,
  exam_board text,
  product_kind text not null default 'digital' check (product_kind in ('digital', 'physical')),
  stock_quantity integer,
  is_featured boolean not null default false,
  is_published boolean not null default false,
  image_path text,
  preview_path text,
  download_path text,
  keywords text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shop_orders (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text unique,
  customer_email text not null,
  customer_name text,
  shipping_name text,
  shipping_line1 text,
  shipping_line2 text,
  shipping_city text,
  shipping_postcode text,
  shipping_country text default 'GB',
  shipping_phone text,
  items jsonb not null default '[]'::jsonb,
  subtotal_pence integer not null default 0,
  total_pence integer not null default 0,
  payment_status text not null default 'pending',
  has_physical boolean not null default false,
  has_digital boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.shop_products enable row level security;
alter table public.shop_orders enable row level security;

drop policy if exists "public can read published shop products" on public.shop_products;
create policy "public can read published shop products"
  on public.shop_products
  for select
  using (is_published = true);

create index if not exists shop_products_published_featured_idx
  on public.shop_products (is_published, is_featured, sort_order, created_at desc);

create index if not exists shop_products_search_idx
  on public.shop_products using gin (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(short_description, '') || ' ' || coalesce(keywords, ''))
  );

create index if not exists shop_orders_stripe_session_idx
  on public.shop_orders (stripe_session_id);

create index if not exists shop_orders_customer_email_idx
  on public.shop_orders (customer_email, created_at desc);
