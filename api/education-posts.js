import { createClient } from '@supabase/supabase-js';
import { hasAwardingBodyUrl, looksLikeOfficialPaper, tidyDownloadFilename } from './_lib/resourceNormalize.js';
import { handleShopPublicRequest, wantsShopPublicRequest } from './_lib/shopHandlers.js';
import { handleAnalyticsEventRequest, wantsAnalyticsEventRequest } from './_lib/analyticsHandlers.js';

function resourceSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://xugsznxfvpbifpzpuoek.supabase.co';
}

function resourceSupabaseKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY
    || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    || process.env.VITE_SUPABASE_ANON_KEY
    || 'sb_publishable_hPyUFmC3SzL4kcdpzzVdMA_UDlx6_PC';
}

function safeFilename(name, fallback = 'resource') {
  const cleaned = String(name || fallback).replace(/[\r\n"]/g, '').trim() || fallback;
  return cleaned.slice(0, 180);
}

function wantsResourceFile(req) {
  const kind = String(req.query?.kind || '');
  const url = String(req.url || '');
  return kind === 'file' || url.includes('resource-file') || url.includes('kind=file');
}

async function sendResourceFile(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const id = req.query?.id;
  if (!id || String(id).startsWith('static-')) {
    return res.status(400).json({ error: 'Missing resource id' });
  }

  try {
    const supabase = createClient(resourceSupabaseUrl(), resourceSupabaseKey());
    const { data, error } = await supabase
      .from('resources')
      .select('id,title,file_name,file_url,file_type,storage_path,published')
      .eq('id', id)
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    if (!data || data.published === false || !data.file_url) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    if (looksLikeOfficialPaper(data)) {
      if (hasAwardingBodyUrl(data)) {
        res.setHeader('Location', data.file_url_override || data.file_url);
        return res.status(302).end();
      }
      return res.status(404).json({ error: 'Official exam materials are not hosted on JD Science' });
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
    const filename = safeFilename(tidyDownloadFilename(data) || data.file_name || data.title);
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

export default async function handler(req, res) {
  if (wantsAnalyticsEventRequest(req)) return handleAnalyticsEventRequest(req, res);
  if (wantsShopPublicRequest(req)) return handleShopPublicRequest(req, res);
  if (wantsResourceFile(req)) return sendResourceFile(req, res);

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
