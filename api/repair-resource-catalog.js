import { createClient } from '@supabase/supabase-js';
import { isDeadResource, repairPatchForResource } from './_lib/resourceNormalize.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(503).json({ error: 'Server not configured for catalog repair.' });
  }

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data, error } = await supabase
      .from('resources')
      .select('id,title,subject,level,exam_board,resource_category,file_name,file_url,storage_path,published')
      .eq('published', true)
      .limit(5000);

    if (error) return res.status(500).json({ error: error.message });

    let updated = 0;
    const changes = [];
    for (const row of data || []) {
      const patch = repairPatchForResource(row);
      if (isDeadResource(row)) patch.published = false;
      if (!Object.keys(patch).length) continue;
      const { error: updateError } = await supabase.from('resources').update(patch).eq('id', row.id);
      if (updateError) {
        console.error('repair update failed', row.id, updateError.message);
        continue;
      }
      updated += 1;
      changes.push({ id: row.id, patch });
    }

    return res.status(200).json({ ok: true, updated, changes: changes.slice(0, 80) });
  } catch (err) {
    console.error('repair-resource-catalog failed:', err?.message || err);
    return res.status(500).json({ error: err?.message || 'Failed to repair catalog' });
  }
}
