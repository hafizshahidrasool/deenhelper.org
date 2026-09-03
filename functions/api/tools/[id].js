import { isAuthed, unauthorized } from '../../_auth.js';

export async function onRequestPut({ request, env, params }) {
  if (!isAuthed(request, env)) return unauthorized();

  const { name, slug, description, url, is_active } = await request.json();

  await env.DB.prepare(
    'UPDATE tools SET name = ?, slug = ?, description = ?, url = ?, is_active = ? WHERE id = ?'
  ).bind(name, slug, description || '', url, is_active ? 1 : 0, params.id).run();

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function onRequestDelete({ request, env, params }) {
  if (!isAuthed(request, env)) return unauthorized();

  await env.DB.prepare('DELETE FROM tools WHERE id = ?').bind(params.id).run();

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
