// Shared helper: checks if the request has a valid admin session cookie.
// Used by every protected endpoint (anything that adds/edits/deletes data).

export function isAuthed(request, env) {
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(/admin_session=([^;]+)/);
  if (!match) return false;
  return match[1] === env.ADMIN_TOKEN;
}

export function unauthorized() {
  return new Response(JSON.stringify({ error: 'Not logged in' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' }
  });
}
