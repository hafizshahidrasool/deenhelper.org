import { isAuthed, unauthorized } from '../_auth.js';

// GET /api/blog  -> public, returns published posts (used by blog.html)
export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    'SELECT id, title, slug, content, title_ur, content_ur, created_at FROM blog_posts WHERE published = 1 ORDER BY created_at DESC'
  ).all();
  return new Response(JSON.stringify(results), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// POST /api/blog -> admin only, creates a new post
export async function onRequestPost({ request, env }) {
  if (!isAuthed(request, env)) return unauthorized();

  const { title, slug, content, title_ur, content_ur, published } = await request.json();
  if (!title || !slug || !content) {
    return new Response(JSON.stringify({ error: 'title, slug and content are required' }), { status: 400 });
  }

  await env.DB.prepare(
    'INSERT INTO blog_posts (title, slug, content, title_ur, content_ur, published) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(title, slug, content, title_ur || null, content_ur || null, published ? 1 : 0).run();

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
