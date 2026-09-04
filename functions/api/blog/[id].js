import { isAuthed, unauthorized } from '../../_auth.js';

// PUT /api/blog/:id -> admin only, edits an existing post
export async function onRequestPut({ request, env, params }) {
  if (!isAuthed(request, env)) return unauthorized();

  const { title, slug, content, title_ur, content_ur, published } = await request.json();

  await env.DB.prepare(
    'UPDATE blog_posts SET title = ?, slug = ?, content = ?, title_ur = ?, content_ur = ?, published = ? WHERE id = ?'
  ).bind(title, slug, content, title_ur || null, content_ur || null, published ? 1 : 0, params.id).run();

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// DELETE /api/blog/:id -> admin only
export async function onRequestDelete({ request, env, params }) {
  if (!isAuthed(request, env)) return unauthorized();

  await env.DB.prepare('DELETE FROM blog_posts WHERE id = ?').bind(params.id).run();

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
