import { isAuthed, unauthorized } from '../_auth.js';

// GET /api/blog
// - اگر ?lang=en یا ?lang=ur دے کر کال کریں (جیسے فرنٹ اینڈ کرتا ہے) -> صرف ایک زبان کا ڈیٹا واپس آئے گا
// - اگر بغیر کسی پیرامیٹر کے کال کریں (جیسے ایڈمن پینل کرتا ہے) -> تمام کالمز (انگلش + اردو) واپس آئیں گے
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const lang = url.searchParams.get('lang');

  // 1. ڈیٹا بیس سے تمام ڈیٹا حاصل کریں (دونوں زبانوں کے کالم سمیت)
  const { results } = await env.DB.prepare(
    'SELECT id, title, slug, content, title_ur, content_ur, created_at FROM blog_posts WHERE published = 1 ORDER BY created_at DESC'
  ).all();

  // 2. اگر lang پیرامیٹر موجود نہیں ہے (یعنی ایڈمن پینل سے درخواست آئی ہے)
  //    تو پورا خام ڈیٹا (raw data) واپس بھیجیں تاکہ ایڈمن میں دونوں زبانیں صحیح جگہوں پر دکھیں
  if (!lang) {
    return new Response(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 3. اگر lang پیرامیٹر موجود ہے (یعنی فرنٹ اینڈ ویب سائٹ سے درخواست آئی ہے)
  //    تو صرف مطلوبہ زبان کا ڈیٹا بنا کر بھیجیں
  const localizedResults = results.map(post => {
    let title, content;
    if (lang === 'ur') {
      // اگر اردو خالی ہے تو انگلش کو فال بیک کے طور پر استعمال کریں
      title = post.title_ur || post.title;
      content = post.content_ur || post.content;
    } else {
      // انگلش کے لیے (یا کوئی اور زبان) ڈیفالٹ انگلش کالم استعمال کریں
      title = post.title;
      content = post.content;
    }
    
    return {
      id: post.id,
      title: title,
      content: content,
      slug: post.slug,
      created_at: post.created_at
    };
  });

  return new Response(JSON.stringify(localizedResults), {
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
