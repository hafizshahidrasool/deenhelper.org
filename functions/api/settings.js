import { isAuthed, unauthorized } from '../_auth.js';

// GET /api/settings -> public, returns all settings as one object
// e.g. { "mosque_list": "[...]", "prayer_settings": "{...}" }
export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare('SELECT key, value FROM settings').all();
  const settings = {};
  for (const row of results) settings[row.key] = row.value;

  return new Response(JSON.stringify(settings), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// PUT /api/settings -> admin only, body: { "key": "mosque_list", "value": "[...]" }
export async function onRequestPut({ request, env }) {
  if (!isAuthed(request, env)) return unauthorized();

  const { key, value } = await request.json();
  if (!key) return new Response(JSON.stringify({ error: 'key is required' }), { status: 400 });

  await env.DB.prepare(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
  ).bind(key, value).run();

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
