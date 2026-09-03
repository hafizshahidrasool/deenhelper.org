export async function onRequestPost() {
  const headers = new Headers({ 'Content-Type': 'application/json' });
  headers.append('Set-Cookie', 'admin_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0');
  return new Response(JSON.stringify({ success: true }), { headers });
}
