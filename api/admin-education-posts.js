import { createClient } from '@supabase/supabase-js';
import { handleShopAdminRequest, wantsShopAdminRequest } from './_lib/shopHandlers.js';
import { handleResourceUploadRequest, wantsResourceUploadRequest } from './_lib/resourceUpload.js';
import { parseRequestBody, safeTrim } from './_lib/tutors.js';

const CATEGORIES = new Set(['revision-advice', 'exam-tips', 'education-news']);

function safeEqual(a, b) {
  const sa = String(a || '');
  const sb = String(b || '');
  if (sa.length !== sb.length) return false;
  let diff = 0;
  for (let i = 0; i < sa.length; i++) diff |= sa.charCodeAt(i) ^ sb.charCodeAt(i);
  return diff === 0;
}

function isMissingTable(error) {
  return /education_posts|schema cache|does not exist/i.test(error?.message || '');
}

function normalizePost(body) {
  const title = safeTrim(body.title, 180);
  const category = safeTrim(body.category, 40);
  const summary = safeTrim(body.summary, 400);
  const rawBody = safeTrim(body.body, 12000);
  const published = body.published !== false;

  if (!title || !summary || !rawBody) {
    return { ok: false, error: 'Title, summary and full text are required.' };
  }
  if (!CATEGORIES.has(category)) {
    return { ok: false, error: 'Choose revision advice, exam tips or education news.' };
  }

  return {
    ok: true,
    fields: {
      title,
      category,
      summary,
      body: rawBody,
      published,
      published_at: published ? (body.published_at || new Date().toISOString()) : (body.published_at || new Date().toISOString()),
      updated_at: new Date().toISOString(),
    },
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = parseRequestBody(req.body) || {};

  if (wantsResourceUploadRequest(req, body)) {
    return handleResourceUploadRequest(req, res, body);
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return res.status(500).json({ error: 'Admin dashboard is not configured yet.' });
  }

  const provided = req.headers['x-admin-password'] || body.password;
  if (!provided || !safeEqual(provided, adminPassword)) {
    return res.status(401).json({ error: 'Incorrect password.' });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: 'Server not configured for database access.' });
  }

  const action = safeTrim(body.action, 20) || 'list';
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    if (wantsShopAdminRequest(req, body)) {
      return handleShopAdminRequest(req, res, body, supabase);
    }

    if (action === 'list') {
      const { data, error } = await supabase
        .from('education_posts')
        .select('*')
        .order('published_at', { ascending: false });
      if (error) {
        if (isMissingTable(error)) {
          return res.status(200).json({ ok: true, posts: [], setupRequired: true });
        }
        return res.status(500).json({ error: error.message || 'Failed to load posts' });
      }
      return res.status(200).json({ ok: true, posts: data || [] });
    }

    if (action === 'create' || action === 'update') {
      const parsed = normalizePost(body.post || {});
      if (!parsed.ok) return res.status(400).json({ error: parsed.error });

      if (action === 'create') {
        const { data, error } = await supabase
          .from('education_posts')
          .insert([parsed.fields])
          .select('*')
          .single();
        if (error) {
          if (isMissingTable(error)) {
            return res.status(409).json({ error: 'The education_posts table has not been created yet.', setupRequired: true });
          }
          return res.status(500).json({ error: error.message || 'Failed to save post' });
        }
        return res.status(200).json({ ok: true, post: data });
      }

      const id = body.post?.id;
      if (!id) return res.status(400).json({ error: 'Missing post id.' });
      const { data, error } = await supabase
        .from('education_posts')
        .update(parsed.fields)
        .eq('id', id)
        .select('*')
        .single();
      if (error) {
        return res.status(500).json({ error: error.message || 'Failed to update post' });
      }
      return res.status(200).json({ ok: true, post: data });
    }

    if (action === 'delete') {
      const id = body.id || body.post?.id;
      if (!id) return res.status(400).json({ error: 'Missing post id.' });
      const { error } = await supabase.from('education_posts').delete().eq('id', id);
      if (error) {
        return res.status(500).json({ error: error.message || 'Failed to delete post' });
      }
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: 'Unknown action.' });
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'Failed to update posts' });
  }
}
