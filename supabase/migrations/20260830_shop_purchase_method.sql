-- Purchase method for JDScience checkout vs external retailers.
-- Safe to run more than once. Existing rows stay jdscience unless already external.

alter table public.shop_products
  add column if not exists purchase_method text not null default 'jdscience';

alter table public.shop_products
  add column if not exists retailer_name text;

alter table public.shop_products
  add column if not exists show_price boolean not null default true;

update public.shop_products
set purchase_method = 'external'
where opens_external = true
  and purchase_method is distinct from 'external';

update public.shop_products
set opens_external = true
where purchase_method = 'external'
  and opens_external is distinct from true;
