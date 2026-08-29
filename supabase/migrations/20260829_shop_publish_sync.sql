-- Keep legacy published/featured columns in sync with is_published/is_featured.

alter table public.shop_products
  add column if not exists published boolean not null default false,
  add column if not exists featured boolean not null default false;

update public.shop_products
set is_published = true
where published = true
  and coalesce(is_published, false) = false;

update public.shop_products
set published = true
where is_published = true
  and coalesce(published, false) = false;

update public.shop_products
set is_featured = true
where featured = true
  and coalesce(is_featured, false) = false;

update public.shop_products
set featured = true
where is_featured = true
  and coalesce(featured, false) = false;

create index if not exists shop_products_legacy_published_featured_idx
  on public.shop_products (published, featured, sort_order, created_at desc);
