// GET /blog/:slug
// This renders a COMPLETE, ready-to-read HTML page for a single blog post,
// with the title, description and full article text already baked into the
// HTML response. Unlike blog.html (which fetches posts with JavaScript after
// the page loads), this page needs no JavaScript for its content to be
// visible, so Google, ChatGPT, Gemini, Claude and any other crawler can read
// the full article on the first request. This is the fix for the "blog
// content invisible to AI crawlers" problem.

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function makeExcerpt(html, maxLen = 160) {
  const text = String(html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > maxLen ? text.slice(0, maxLen).trim() + '…' : text;
}

function notFoundPage() {
  return new Response(
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Post Not Found | Deen Helper Blog</title>
  <meta name="robots" content="noindex">
  <meta http-equiv="refresh" content="3;url=/blog.html">
</head>
<body style="font-family:sans-serif;text-align:center;padding:60px 20px;background:#030712;color:#fff;">
  <h1>Post not found</h1>
  <p>Redirecting you to the <a href="/blog.html" style="color:#34d399;">blog</a>...</p>
</body>
</html>`,
    { status: 404, headers: { 'Content-Type': 'text/html;charset=UTF-8' } }
  );
}

export async function onRequestGet({ params, env }) {
  const slug = params.slug;

  const post = await env.DB.prepare(
    'SELECT title, slug, content, title_ur, content_ur, created_at FROM blog_posts WHERE slug = ? AND published = 1'
  ).bind(slug).first();

  if (!post) return notFoundPage();

  const title = post.title;
  const titleUr = post.title_ur || post.title;
  const content = post.content;
  const contentUr = post.content_ur || post.content;
  const description = makeExcerpt(content, 160);
  const url = `https://deenhelper.org/blog/${post.slug}`;
  const dateIso = (() => {
    const d = new Date(post.created_at);
    return isNaN(d) ? new Date().toISOString() : d.toISOString();
  })();
  const dateDisplay = escapeHtml(post.created_at || '');

  const html = `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)} | Deen Helper Blog</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${url}" />

    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="Deen Helper" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="https://deenhelper.org/og-image.jpg" />
    <meta property="og:locale" content="en_US" />
    <meta property="article:published_time" content="${dateIso}" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="https://deenhelper.org/og-image.jpg" />

    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": ${JSON.stringify(title)},
      "description": ${JSON.stringify(description)},
      "datePublished": "${dateIso}",
      "url": "${url}",
      "mainEntityOfPage": "${url}",
      "author": { "@type": "Organization", "name": "Deen Helper", "url": "https://deenhelper.org/" },
      "publisher": { "@type": "Organization", "name": "Deen Helper", "url": "https://deenhelper.org/" },
      "isPartOf": { "@type": "Blog", "name": "Deen Helper Blog", "url": "https://deenhelper.org/blog.html" }
    }
    </script>

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>

    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: { sans: ['"Plus Jakarta Sans"', 'sans-serif'] },
                    colors: {
                        emerald: { 500: '#10b981', 600: '#059669' },
                        dark: { 950: '#030712', 900: '#0f172a', 800: '#1e293b' }
                    }
                }
            }
        }
    </script>

    <style>
        .glass-panel { background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.06); }
        .gradient-text { background: linear-gradient(135deg, #ffffff 30%, #34d399 70%, #f59e0b 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent; }
        .mobile-submenu { transition: all 0.3s ease-in-out; max-height: 0; opacity: 0; overflow: hidden; }
        .mobile-submenu.open { max-height: 500px; opacity: 1; }
        .chevron-icon { transition: transform 0.3s ease; }
        .chevron-icon.open { transform: rotate(180deg); }
        .lang-btn { font-size: 0.7rem; font-weight: 700; padding: 0.25rem 0.5rem; border-radius: 0.5rem; transition: all 0.2s ease; }
        .lang-btn.text-emerald-400 { background: rgba(16, 185, 129, 0.1); }
        .article-body :is(h2,h3) { color: #fff; font-weight: 800; margin-top: 1.5em; margin-bottom: 0.5em; }
        .article-body h2 { font-size: 1.5rem; }
        .article-body h3 { font-size: 1.25rem; }
        .article-body p { margin-bottom: 1em; line-height: 1.75; }
        .article-body ul, .article-body ol { margin: 1em 0 1em 1.25em; }
        .article-body li { margin-bottom: 0.5em; }
        .article-body a { color: #34d399; text-decoration: underline; }
    </style>
</head>
<body class="bg-dark-950 text-slate-100 font-sans antialiased overflow-x-hidden pb-16 md:pb-0">

    <!-- ===== NAVBAR ===== -->
    <nav aria-label="Main navigation" class="sticky top-0 z-50 glass-panel border-b border-white/5 transition-all duration-300">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-20">
                <a href="/index.html" class="flex items-center gap-2.5">
                    <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <i data-lucide="moon" class="w-5 h-5 text-white"></i>
                    </div>
                    <span class="text-xl font-extrabold tracking-tight text-white">Deen <span class="text-emerald-400">Helper</span></span>
                </a>
                <div class="hidden lg:flex items-center gap-6">
                    <a href="/index.html" class="text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-white" data-en="Home" data-ur="ہوم">Home</a>
                    <a href="/about.html" class="text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-white" data-en="About" data-ur="ہمارے بارے میں">About</a>
                    <a href="/blog.html" class="text-xs font-semibold uppercase tracking-wider text-emerald-400" data-en="Blog" data-ur="بلاگ">Blog</a>
                    <a href="/contact.html" class="text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-white" data-en="Contact" data-ur="رابطہ">Contact</a>
                    <div class="flex items-center gap-1 pl-3 border-l border-white/10">
                        <button class="lang-btn text-emerald-400" data-lang="en">EN</button>
                        <span class="text-slate-500 text-xs">|</span>
                        <button class="lang-btn text-slate-300" data-lang="ur">اردو</button>
                    </div>
                </div>
                <div class="lg:hidden flex items-center gap-2">
                    <div class="flex items-center gap-1">
                        <button class="lang-btn text-emerald-400" data-lang="en">EN</button>
                        <span class="text-slate-500 text-xs">|</span>
                        <button class="lang-btn text-slate-300" data-lang="ur">اردو</button>
                    </div>
                    <button id="mobile-menu-btn" aria-label="Open menu" aria-expanded="false" class="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors focus:outline-none">
                        <i data-lucide="menu" class="w-6 h-6"></i>
                    </button>
                </div>
            </div>
        </div>
        <div id="mobile-menu" class="hidden lg:hidden glass-panel border-t border-white/5 px-4 pt-3 pb-6 space-y-2">
            <a href="/index.html" class="block px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5" data-en="Home" data-ur="ہوم">Home</a>
            <a href="/about.html" class="block px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5" data-en="About Us" data-ur="ہمارے بارے میں">About Us</a>
            <a href="/blog.html" class="block px-4 py-2.5 rounded-xl text-sm font-semibold text-emerald-400 bg-white/10" data-en="Blog" data-ur="بلاگ">Blog</a>
            <a href="/contact.html" class="block px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5" data-en="Contact Us" data-ur="رابطہ کریں">Contact Us</a>
        </div>
    </nav>

    <main>
    <article class="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <a href="/blog.html" class="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-400 hover:text-emerald-300 mb-6" data-en="Back to Blog" data-ur="بلاگ پر واپس جائیں">
            <i data-lucide="arrow-left" class="w-4 h-4"></i> Back to Blog
        </a>

        <p class="text-xs text-slate-500 mb-3">${dateDisplay}</p>

        <h1 id="post-title" class="text-3xl sm:text-4xl font-extrabold text-white mb-8 leading-tight">${escapeHtml(title)}</h1>

        <div id="content-en" class="article-body text-slate-300">${content}</div>
        <div id="content-ur" class="article-body text-slate-300 hidden" dir="rtl">${contentUr}</div>
    </article>
    </main>

    <!-- ===== FOOTER ===== -->
    <footer class="border-t border-white/5 py-12 relative z-10 bg-dark-950">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div class="flex flex-col items-center justify-center gap-2">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <i data-lucide="moon" class="w-5 h-5 text-white"></i>
                </div>
                <span class="text-lg font-extrabold tracking-tight text-white">Deen <span class="text-emerald-400">Helper</span></span>
            </div>
            <p class="text-[10px] text-slate-400 text-center border-t border-white/5 pt-6" data-en="© 2026 Deen Helper. All Rights Reserved." data-ur="© 2026 دین ہیلپر۔ جملہ حقوق محفوظ ہیں۔">&copy; 2026 Deen Helper. All Rights Reserved.</p>
        </div>
    </footer>

    <script>
        lucide.createIcons();

        document.getElementById('mobile-menu-btn').addEventListener('click', () => {
            document.getElementById('mobile-menu').classList.toggle('hidden');
        });

        // This page's title and content already came fully rendered from the server
        // (that's the GEO fix), so the language toggle here only needs to swap
        // between the two versions that were sent down, no fetch required.
        let currentLang = 'en';
        const titleEl = document.getElementById('post-title');
        const contentEn = document.getElementById('content-en');
        const contentUr = document.getElementById('content-ur');
        const titleEn = ${JSON.stringify(title)};
        const titleUrText = ${JSON.stringify(titleUr)};

        function applyLang(lang) {
            currentLang = lang;
            document.documentElement.lang = lang;
            document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr';

            document.querySelectorAll('[data-en]').forEach(el => {
                const text = lang === 'ur' ? el.getAttribute('data-ur') : el.getAttribute('data-en');
                if (text !== null) el.textContent = text;
            });

            titleEl.textContent = lang === 'ur' ? titleUrText : titleEn;
            contentEn.classList.toggle('hidden', lang === 'ur');
            contentUr.classList.toggle('hidden', lang !== 'ur');

            document.querySelectorAll('.lang-btn').forEach(btn => {
                const active = btn.dataset.lang === lang;
                btn.classList.toggle('text-emerald-400', active);
                btn.classList.toggle('text-slate-300', !active);
            });

            localStorage.setItem('deenhelper_lang', lang);
        }

        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const newLang = btn.dataset.lang;
                if (newLang !== currentLang) applyLang(newLang);
            });
        });

        const savedLang = localStorage.getItem('deenhelper_lang') || 'en';
        applyLang(savedLang);
    </script>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html;charset=UTF-8' }
  });
}
