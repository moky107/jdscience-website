import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: 'Server not configured for database access.' });
  }

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data, error } = await supabase
      .from('education_posts')
      .select('id, title, category, summary, body, published_at')
      .eq('published', true)
      .order('published_at', { ascending: false });

    if (error) {
      const missing = /education_posts|schema cache|does not exist/i.test(error.message || '');
      if (missing) {
        return res.status(200).json({ ok: true, posts: [], setupRequired: true });
      }
      return res.status(500).json({ error: error.message || 'Failed to load posts' });
    }

    return res.status(200).json({ ok: true, posts: data || [] });
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'Failed to load posts' });
  }
}
