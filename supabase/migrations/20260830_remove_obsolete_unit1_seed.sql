-- Remove the leftover auto-seeded shop row. Do not touch the replacement
-- BTEC Unit 1 product or the Amazon chemistry book.

delete from public.shop_products
where title = 'Unit 1 specialise cells'
  and slug = 'unit-1-specialise-cells'
  and id <> '53fa4258-a265-44f9-b605-a6bf512a2f03'
  and id <> '503d4625-94df-4d80-b6d0-7c06cebdf693';
