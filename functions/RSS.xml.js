// RSS Feed for DeenHelper Blog
// URL: https://deenhelper.org/rss.xml

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    `SELECT title, slug, content, created_at
     FROM blog_posts
     WHERE published = 1
     ORDER BY created_at DESC
     LIMIT 50`
  ).all();

  function escapeXml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  function stripHtml(value) {
    return String(value || '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function makeDate(value) {
    const date = new Date(value);
    return isNaN(date.getTime())
      ? new Date().toUTCString()
      : date.toUTCString();
  }

  const items = results.map(post => {
    const title = escapeXml(post.title);
    const description = escapeXml(stripHtml(post.content));
    const link = `https://deenhelper.org/blog/${encodeURIComponent(post.slug)}`;

    return `
      <item>
        <title>${title}</title>
        <link>${link}</link>
        <guid isPermaLink="true">${link}</guid>
        <description>${description}</description>
        <pubDate>${makeDate(post.created_at)}</pubDate>
      </item>
    `;
  }).join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Deen Helper Blog</title>
    <link>https://deenhelper.org/blog.html</link>
    <description>Latest articles from Deen Helper</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=UTF-8',
      'Cache-Control': 'no-cache'
    }
  });
}
