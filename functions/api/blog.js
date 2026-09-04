import { isAuthed, unauthorized } from '../_auth.js';

// GET /api/blog  -> public, returns published posts (used by blog.html)
export async function onRequestGet({ request, env }) {
  // 1. lang پیرامیٹر حاصل کریں (default 'ur'، کیونکہ فرنٹ اینڈ بھی 'ur' ڈیفالٹ استعمال کرتا ہے)
  const url = new URL(request.url);
  const lang = url.searchParams.get('lang') || 'ur';

  // 2. ڈیٹا بیس سے تمام مطلوبہ کالمز حاصل کریں (انگلش اور اردو دونوں)
  const { results } = await env.DB.prepare(
    'SELECT id, title, slug, content, title_ur, content_ur, created_at FROM blog_posts WHERE published = 1 ORDER BY created_at DESC'
  ).all();

  // 3. ہر پوسٹ کو زبان کے مطابق تبدیل کریں
  const localizedResults = results.map(post => {
    // اگر زبان اردو ہے تو اردو کالم استعمال کریں، ورنہ انگلش
    // اگر اردو کالم خالی (null) ہو تو انگلش کو فال بیک کے طور پر استعمال کریں
    let title, content;
    if (lang === 'ur') {
      title = post.title_ur || post.title;   // اگر title_ur نہ ہو تو title (انگلش) استعمال کریں
      content = post.content_ur || post.content;
    } else {
      title = post.title;
      content = post.content;
    }

    // نئی آبجیکٹ صرف وہی فیلڈز رکھیں جو فرنٹ اینڈ کو چاہیے
    return {
      id: post.id,
      title: title,
      content: content,
      slug: post.slug,          // slug بھی زبان کے مطابق ہو سکتا ہے، لیکن آپ نے slug_ur/ slug_en نہیں بنایا، اس لیے ایک ہی slug رکھیں
      created_at: post.created_at
    };
  });

  // 4. JSON رسپانس واپس بھیجیں
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
