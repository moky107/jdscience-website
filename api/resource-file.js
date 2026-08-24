import { createClient } from '@supabase/supabase-js';

function supabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://xugsznxfvpbifpzpuoek.supabase.co';
}

function supabaseKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY
    || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    || process.env.VITE_SUPABASE_ANON_KEY
    || 'sb_publishable_hPyUFmC3SzL4kcdpzzVdMA_UDlx6_PC';
}

function safeFilename(name, fallback = 'resource') {
  const cleaned = String(name || fallback).replace(/[\r\n"]/g, '').trim() || fallback;
  return cleaned.slice(0, 180);
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const id = req.query?.id;
  if (!id || String(id).startsWith('static-')) {
    return res.status(400).json({ error: 'Missing resource id' });
  }

  try {
    const supabase = createClient(supabaseUrl(), supabaseKey());
    const { data, error } = await supabase
      .from('resources')
      .select('id,title,file_name,file_url,file_type,storage_path,published')
      .eq('id', id)
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    if (!data || data.published === false || !data.file_url) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    const upstream = await fetch(data.file_url);
    if (!upstream.ok) {
      const body = await upstream.text().catch(() => '');
      return res.status(404).json({
        error: 'File not found',
        statusCode: String(upstream.status),
        detail: body.slice(0, 200),
      });
    }

    const buf = Buffer.from(await upstream.arrayBuffer());
    const filename = safeFilename(data.file_name || data.title);
    const type = upstream.headers.get('content-type') || data.file_type || 'application/octet-stream';
    res.setHeader('Content-Type', type);
    res.setHeader('Content-Length', String(buf.length));
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.status(200).send(buf);
  } catch (err) {
    console.error('resource-file failed:', err?.message || err);
    return res.status(500).json({ error: err?.message || 'Failed to download file' });
  }
}
