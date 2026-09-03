import { isAuthed, unauthorized } from '../_auth.js';

// GET /api/tools -> public, active tools sorted for display
export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    'SELECT id, name, slug, description, url FROM tools WHERE is_active = 1 ORDER BY sort_order ASC'
  ).all();
  return new Response(JSON.stringify(results), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// POST /api/tools -> admin only, adds a new tool entry (name, link, description)
// Note: this only adds the listing. The actual calculator page/logic still has
// to be built and uploaded separately.
export async function onRequestPost({ request, env }) {
  if (!isAuthed(request, env)) return unauthorized();

  const { name, slug, description, url } = await request.json();
  if (!name || !slug || !url) {
    return new Response(JSON.stringify({ error: 'name, slug and url are required' }), { status: 400 });
  }

  await env.DB.prepare(
    'INSERT INTO tools (name, slug, description, url) VALUES (?, ?, ?, ?)'
  ).bind(name, slug, description || '', url).run();

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
