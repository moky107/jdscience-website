-- Link shop products back to free Resources rows for Copy to Shop.
-- Does not alter or delete the original resource. Prevents duplicate copies.

alter table public.shop_products
  add column if not exists source_resource_id bigint;

create unique index if not exists shop_products_source_resource_id_uidx
  on public.shop_products (source_resource_id)
  where source_resource_id is not null;

comment on column public.shop_products.source_resource_id is
  'Optional resources.id this shop product was copied from. Unique so the same resource cannot be copied twice.';
