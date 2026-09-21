-- Add optional topic/unit field for shop products (e.g. Unit 8).
alter table public.shop_products
  add column if not exists topic text;

comment on column public.shop_products.topic is
  'Optional unit or topic label shown in the shop and admin (e.g. Unit 8).';
