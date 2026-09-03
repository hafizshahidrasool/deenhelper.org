// POST /api/login   body: { "password": "..." }
// On correct password, sets an httpOnly cookie the admin panel uses for every other request.

export async function onRequestPost({ request, env }) {
  try {
    const { password } = await request.json();

    if (!password || password !== env.ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ error: 'Wrong password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const headers = new Headers({ 'Content-Type': 'application/json' });
    headers.append(
      'Set-Cookie',
      `admin_session=${env.ADMIN_TOKEN}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000`
    );

    return new Response(JSON.stringify({ success: true }), { headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Bad request' }), { status: 400 });
  }
}
