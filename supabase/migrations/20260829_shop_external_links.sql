-- External-link shop products (Amazon, KDP, Etsy, Gumroad, TPT, etc.)

alter table public.shop_products
  add column if not exists external_url text,
  add column if not exists external_button_label text default 'Buy now',
  add column if not exists opens_external boolean not null default false;
