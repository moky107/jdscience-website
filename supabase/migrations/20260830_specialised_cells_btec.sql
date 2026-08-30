-- Specialised Cells is a BTEC Unit 1 Biology lesson, not T-Level.
update public.shop_products
set
  level = 'BTEC Level 3',
  exam_board = 'Pearson',
  updated_at = now()
where id = '53fa4258-a265-44f9-b605-a6bf512a2f03'
  and (
    coalesce(level, '') is distinct from 'BTEC Level 3'
    or coalesce(exam_board, '') is distinct from 'Pearson'
  );
