#!/usr/bin/env node
// ============================================
// 🌸 めばえブログ 管理APIサーバー v2
// ============================================
// 記事 CRUD・画像アップロード・公開
// コメント・いいね・フォロー・アクセス解析
// ============================================

const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PORT = 3001;
const BLOG_DIR = __dirname;
const CONTENT_DIR = path.join(BLOG_DIR, 'content', 'posts');
const IMAGES_DIR = path.join(BLOG_DIR, 'static', 'images');
const SOCIAL_DIR = path.join(BLOG_DIR, 'data', 'social');

// === ソーシャルデータ ===
function ensureSocialDir() {
  if (!fs.existsSync(SOCIAL_DIR)) fs.mkdirSync(SOCIAL_DIR, { recursive: true });
}
function readJSON(filename) {
  const fp = path.join(SOCIAL_DIR, filename);
  if (!fs.existsSync(fp)) return null;
  try { return JSON.parse(fs.readFileSync(fp, 'utf-8')); } catch(e) { return null; }
}
function writeJSON(filename, data) {
  ensureSocialDir();
  fs.writeFileSync(path.join(SOCIAL_DIR, filename), JSON.stringify(data, null, 2), 'utf-8');
}

// === hugo.toml カテゴリー管理 ===
const HUGO_TOML_PATH = path.join(BLOG_DIR, 'hugo.toml');

function readCategoriesFromToml() {
  const content = fs.readFileSync(HUGO_TOML_PATH, 'utf-8');
  const categories = [];
  const regex = /\[\[params\.homeCategories\]\]\s*\n\s*icon\s*=\s*"([^"]*)"\s*\n\s*name\s*=\s*"([^"]*)"\s*\n\s*url\s*=\s*"([^"]*)"/g;
  let m;
  while ((m = regex.exec(content)) !== null) {
    categories.push({ icon: m[1], name: m[2], url: m[3] });
  }
  return categories;
}

function writCategoriesToToml(categories) {
  let content = fs.readFileSync(HUGO_TOML_PATH, 'utf-8');
  // 既存のカテゴリーブロックを全て削除
  content = content.replace(/# ─+\n# ホームのカテゴリーボックス[\s\S]*?(?=\n\[(?!params\.homeCategories)|$)/, '');
  content = content.replace(/\[\[params\.homeCategories\]\]\s*\n\s*icon\s*=\s*"[^"]*"\s*\n\s*name\s*=\s*"[^"]*"\s*\n\s*url\s*=\s*"[^"]*"\s*\n?/g, '');
  // 末尾の余分な空行を整理
  content = content.replace(/\n{3,}/g, '\n\n');
  if (!content.endsWith('\n')) content += '\n';
  // 新しいカテゴリーブロックを追加
  let block = '\n# ─────────────────────────────────────────\n';
  block += '# ホームのカテゴリーボックス（順番通りに表示）\n';
  block += '# ─────────────────────────────────────────\n';
  categories.forEach(cat => {
    block += `\n[[params.homeCategories]]\n  icon = "${cat.icon}"\n  name = "${cat.name}"\n  url = "${cat.url}"\n`;
  });
  content += block;
  fs.writeFileSync(HUGO_TOML_PATH, content, 'utf-8');
}

// === ヘルパー ===
function parseFrontMatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: content };
  const metaStr = match[1]; const body = match[2]; const meta = {};
  metaStr.split('\n').forEach(line => {
    const m = line.match(/^(\w+):\s*(.*)$/);
    if (m) {
      let val = m[2].trim();
      if (val.startsWith('[') && val.endsWith(']')) {
        try { val = JSON.parse(val.replace(/'/g, '"')); }
        catch(e) { val = val.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, '')); }
      }
      if (typeof val === 'string') val = val.replace(/^["']|["']$/g, '');
      meta[m[1]] = val;
    }
  });
  return { meta, body };
}

function sendJSON(res, code, data) {
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(data, null, 2));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function generateSlug(title) {
  let s = title.toLowerCase().replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  return s || 'post-' + new Date().toISOString().slice(0, 10);
}

// === Routing ===
async function handleRequest(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  if (req.method === 'OPTIONS') {
    res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' });
    res.end(); return;
  }

  try {

    // ========== 記事一覧 ==========
    if (pathname === '/api/posts' && req.method === 'GET') {
      const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));
      const posts = files.map(file => {
        const content = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf-8');
        const { meta, body } = parseFrontMatter(content);
        return {
          filename: file, slug: file.replace('.md', ''),
          title: meta.title || file, date: meta.date || '',
          draft: meta.draft === 'true' || meta.draft === true,
          categories: Array.isArray(meta.categories) ? meta.categories : (meta.categories ? [meta.categories] : []),
          tags: Array.isArray(meta.tags) ? meta.tags : (meta.tags ? [meta.tags] : []),
          description: meta.description || '',
          bodyPreview: body.trim().substring(0, 100) + '...',
        };
      });
      posts.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      sendJSON(res, 200, { posts }); return;
    }

    // ========== カレンダーデータ ==========
    if (pathname === '/api/calendar' && req.method === 'GET') {
      const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));
      const cal = {};
      files.forEach(file => {
        const content = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf-8');
        const { meta } = parseFrontMatter(content);
        if (meta.date && !(meta.draft === 'true' || meta.draft === true)) {
          const ds = meta.date.slice(0, 10);
          if (!cal[ds]) cal[ds] = [];
          cal[ds].push({ slug: file.replace('.md', ''), title: meta.title || file, categories: Array.isArray(meta.categories) ? meta.categories : [] });
        }
      });
      sendJSON(res, 200, { calendar: cal }); return;
    }

    // ========== 記事1件取得 ==========
    if (pathname.startsWith('/api/posts/') && req.method === 'GET') {
      const slug = pathname.replace('/api/posts/', '');
      const fp = path.join(CONTENT_DIR, slug + '.md');
      if (!fs.existsSync(fp)) { sendJSON(res, 404, { error: '記事が見つかりません' }); return; }
      const content = fs.readFileSync(fp, 'utf-8');
      const { meta, body } = parseFrontMatter(content);
      sendJSON(res, 200, {
        filename: slug + '.md', slug, title: meta.title || '', date: meta.date || '',
        draft: meta.draft === 'true' || meta.draft === true,
        categories: Array.isArray(meta.categories) ? meta.categories : (meta.categories ? [meta.categories] : []),
        tags: Array.isArray(meta.tags) ? meta.tags : (meta.tags ? [meta.tags] : []),
        description: meta.description || '', image: meta.image || '',
        body: body.trim(), raw: content,
      }); return;
    }

    // ========== 記事保存 ==========
    if (pathname === '/api/posts' && req.method === 'POST') {
      const raw = await readBody(req);
      const d = JSON.parse(raw.toString('utf-8'));
      const title = d.title || '無題の記事';
      const slug = d.slug || generateSlug(title);
      const date = d.date || new Date().toISOString().split('T')[0];
      const draft = d.draft !== undefined ? d.draft : false;
      const cats = (d.categories || []).map(c => `"${c}"`).join(', ');
      const tags = (d.tags || []).map(t => `"${t}"`).join(', ');
      const md = `---\ntitle: "${title}"\ndate: ${date}\ndraft: ${draft}\ncategories: [${cats}]\ntags: [${tags}]\ndescription: "${d.description || ''}"\nimage: "${d.image || ''}"\n---\n\n${d.body || ''}\n`;
      const fp = path.join(CONTENT_DIR, slug + '.md');
      const isNew = !fs.existsSync(fp);
      fs.writeFileSync(fp, md, 'utf-8');
      sendJSON(res, 200, { success: true, message: isNew ? '記事を作成しました' : '記事を更新しました', slug, filename: slug + '.md' }); return;
    }

    // ========== 記事削除 ==========
    if (pathname.startsWith('/api/posts/') && req.method === 'DELETE') {
      const slug = pathname.replace('/api/posts/', '');
      const fp = path.join(CONTENT_DIR, slug + '.md');
      if (!fs.existsSync(fp)) { sendJSON(res, 404, { error: '記事が見つかりません' }); return; }
      fs.unlinkSync(fp);
      sendJSON(res, 200, { success: true, message: '記事を削除しました' }); return;
    }

    // ========== 画像アップロード ==========
    if (pathname === '/api/images' && req.method === 'POST') {
      const raw = await readBody(req);
      const ct = req.headers['content-type'] || '';
      if (ct.includes('multipart/form-data')) {
        const boundary = ct.split('boundary=')[1];
        const parts = parseMultipart(raw, boundary);
        const folder = parts.find(p => p.name === 'folder');
        const folderName = folder ? folder.value : 'uploads';
        const targetDir = path.join(IMAGES_DIR, folderName);
        if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
        const uploaded = [];
        parts.filter(p => p.filename).forEach(part => {
          fs.writeFileSync(path.join(targetDir, part.filename), part.data);
          uploaded.push({ filename: part.filename, path: `/images/${folderName}/${part.filename}`, size: part.data.length });
        });
        sendJSON(res, 200, { success: true, uploaded });
      } else { sendJSON(res, 400, { error: 'multipart/form-data必須' }); }
      return;
    }

    // ========== 画像削除 ==========
    if (pathname === '/api/images' && req.method === 'DELETE') {
      const raw = await readBody(req);
      const d = JSON.parse(raw.toString('utf-8'));
      if (!d.path) { sendJSON(res, 400, { error: 'pathが必要' }); return; }
      // パストラバーサル防止
      const resolved = path.resolve(path.join(BLOG_DIR, 'static', d.path));
      const imagesBase = path.resolve(IMAGES_DIR);
      if (!resolved.startsWith(imagesBase)) { sendJSON(res, 403, { error: '不正なパス' }); return; }
      if (!fs.existsSync(resolved)) { sendJSON(res, 404, { error: 'ファイルが見つかりません' }); return; }
      fs.unlinkSync(resolved);
      sendJSON(res, 200, { success: true, message: '画像を削除しました' });
      return;
    }

    // ========== 画像一覧 ==========
    if (pathname === '/api/images' && req.method === 'GET') {
      const folderParam = url.searchParams.get('folder');
      let images = [];
      if (folderParam) {
        const dir = path.join(IMAGES_DIR, folderParam);
        if (fs.existsSync(dir)) images = fs.readdirSync(dir).filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f)).map(f => ({ filename: f, path: `/images/${folderParam}/${f}` }));
      } else if (fs.existsSync(IMAGES_DIR)) {
        fs.readdirSync(IMAGES_DIR).filter(f => fs.statSync(path.join(IMAGES_DIR, f)).isDirectory()).forEach(folder => {
          fs.readdirSync(path.join(IMAGES_DIR, folder)).filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f)).forEach(f => {
            images.push({ filename: f, folder, path: `/images/${folder}/${f}` });
          });
        });
      }
      sendJSON(res, 200, { images }); return;
    }

    // ========== いいね ==========
    if (pathname === '/api/likes' && req.method === 'GET') {
      const slug = url.searchParams.get('slug');
      const likes = readJSON('likes.json') || {};
      if (slug === '__all__') { sendJSON(res, 200, { allLikes: likes }); return; }
      sendJSON(res, 200, slug ? { slug, count: likes[slug] || 0 } : { likes }); return;
    }
    if (pathname === '/api/likes' && req.method === 'POST') {
      const raw = await readBody(req); const d = JSON.parse(raw.toString('utf-8'));
      if (!d.slug) { sendJSON(res, 400, { error: 'slugが必要' }); return; }
      const likes = readJSON('likes.json') || {};
      likes[d.slug] = (likes[d.slug] || 0) + 1;
      writeJSON('likes.json', likes);
      sendJSON(res, 200, { success: true, slug: d.slug, count: likes[d.slug] }); return;
    }

    // ========== コメント ==========
    if (pathname === '/api/comments' && req.method === 'GET') {
      const slug = url.searchParams.get('slug');
      const comments = readJSON('comments.json') || {};
      if (slug === '__all__') { sendJSON(res, 200, { allComments: comments }); return; }
      if (slug) {
        sendJSON(res, 200, { slug, comments: comments[slug] || [] });
      } else {
        let total = 0; const recent = [];
        Object.keys(comments).forEach(s => { const arr = comments[s] || []; total += arr.length; arr.forEach(c => recent.push({ ...c, slug: s })); });
        recent.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
        sendJSON(res, 200, { totalCount: total, recent: recent.slice(0, 50), all: comments });
      }
      return;
    }
    if (pathname === '/api/comments' && req.method === 'POST') {
      const raw = await readBody(req); const d = JSON.parse(raw.toString('utf-8'));
      if (!d.slug || !d.name || !d.message) { sendJSON(res, 400, { error: 'slug, name, message必須' }); return; }
      const comments = readJSON('comments.json') || {};
      if (!comments[d.slug]) comments[d.slug] = [];
      const c = { id: Date.now().toString(36) + Math.random().toString(36).slice(2,6), name: d.name.trim().slice(0,50), message: d.message.trim().slice(0,1000), date: new Date().toISOString() };
      comments[d.slug].push(c);
      writeJSON('comments.json', comments);
      sendJSON(res, 200, { success: true, comment: c }); return;
    }
    if ((pathname.startsWith('/api/comments/') || pathname === '/api/comments') && req.method === 'DELETE') {
      const cid = pathname === '/api/comments' ? url.searchParams.get('id') : pathname.replace('/api/comments/', '');
      const slug = url.searchParams.get('slug');
      if (!slug || !cid) { sendJSON(res, 400, { error: 'slugとid必須' }); return; }
      const comments = readJSON('comments.json') || {};
      if (comments[slug]) { comments[slug] = comments[slug].filter(c => c.id !== cid); writeJSON('comments.json', comments); }
      sendJSON(res, 200, { success: true }); return;
    }

    // ========== フォロー ==========
    if (pathname === '/api/followers' && req.method === 'GET') {
      sendJSON(res, 200, readJSON('followers.json') || { followers: [], count: 0 }); return;
    }
    if (pathname === '/api/follow' && req.method === 'POST') {
      const raw = await readBody(req); const d = JSON.parse(raw.toString('utf-8'));
      if (!d.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) { sendJSON(res, 400, { error: '有効なメールアドレスが必要' }); return; }
      const fd = readJSON('followers.json') || { followers: [], count: 0 };
      if (fd.followers.some(f => f.email === d.email)) { sendJSON(res, 200, { success: true, message: 'すでにフォロー済みです', alreadyFollowing: true }); return; }
      fd.followers.push({ name: (d.name || '匿名').trim().slice(0,50), email: d.email.trim().toLowerCase(), date: new Date().toISOString() });
      fd.count = fd.followers.length;
      writeJSON('followers.json', fd);
      sendJSON(res, 200, { success: true, message: 'フォローありがとうございます！', count: fd.count }); return;
    }
    if (pathname === '/api/unfollow' && req.method === 'POST') {
      const raw = await readBody(req); const d = JSON.parse(raw.toString('utf-8'));
      const fd = readJSON('followers.json') || { followers: [], count: 0 };
      fd.followers = fd.followers.filter(f => f.email !== d.email);
      fd.count = fd.followers.length;
      writeJSON('followers.json', fd);
      sendJSON(res, 200, { success: true }); return;
    }

    // ========== アクセス解析 ==========
    if (pathname === '/api/track' && req.method === 'POST') {
      const raw = await readBody(req); const d = JSON.parse(raw.toString('utf-8'));
      const page = d.page || '/'; const today = new Date().toISOString().slice(0, 10);
      const a = readJSON('analytics.json') || { pageViews: {}, dailyViews: {}, totalViews: 0 };
      a.pageViews[page] = (a.pageViews[page] || 0) + 1;
      if (!a.dailyViews[today]) a.dailyViews[today] = 0;
      a.dailyViews[today]++;
      a.totalViews++;
      writeJSON('analytics.json', a);
      sendJSON(res, 200, { success: true }); return;
    }
    if (pathname === '/api/analytics' && req.method === 'GET') {
      const a = readJSON('analytics.json') || { pageViews: {}, dailyViews: {}, totalViews: 0 };
      const fd = readJSON('followers.json') || { count: 0 };
      const likes = readJSON('likes.json') || {};
      const comments = readJSON('comments.json') || {};
      const popular = Object.entries(a.pageViews).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([p, v]) => ({ page: p, views: v }));
      const last30 = []; for (let i = 29; i >= 0; i--) { const dt = new Date(); dt.setDate(dt.getDate() - i); const ds = dt.toISOString().slice(0, 10); last30.push({ date: ds, views: a.dailyViews[ds] || 0 }); }
      const today = new Date().toISOString().slice(0, 10);
      let totalComments = 0; Object.values(comments).forEach(arr => { totalComments += (arr || []).length; });
      sendJSON(res, 200, {
        totalViews: a.totalViews, todayViews: a.dailyViews[today] || 0,
        followerCount: fd.count, totalLikes: Object.values(likes).reduce((s, n) => s + n, 0),
        totalComments, popularPages: popular, last30days: last30,
      }); return;
    }

    // ========== 公開 ==========
    if (pathname === '/api/publish' && req.method === 'POST') {
      const raw = await readBody(req);
      let msg = '記事を更新'; try { const d = JSON.parse(raw.toString('utf-8')); if (d.message) msg = d.message; } catch(e) {}
      try {
        execSync('hugo --minify', { cwd: BLOG_DIR, stdio: 'pipe' });
        execSync('git add -A', { cwd: BLOG_DIR, stdio: 'pipe' });
        try { const st = execSync('git status --porcelain', { cwd: BLOG_DIR }).toString().trim(); if (!st) { sendJSON(res, 200, { success: true, message: '変更なし' }); return; } } catch(e) {}
        execSync(`git commit -m "${msg} - ${new Date().toISOString().slice(0,10)}"`, { cwd: BLOG_DIR, stdio: 'pipe' });
        const cfgPath = path.join(BLOG_DIR, '.blog-config.json');
        let pushCmd = 'git push origin main';
        if (fs.existsSync(cfgPath)) { const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf-8')); if (cfg.githubToken && cfg.githubRepo) { pushCmd = `git push https://${cfg.githubUser || 'Ethan0621'}:${cfg.githubToken}@github.com/${cfg.githubRepo}.git main`; } }
        execSync(pushCmd, { cwd: BLOG_DIR, stdio: 'pipe' });
        sendJSON(res, 200, { success: true, message: '🎉 公開完了！ 1〜2分後にサイトに反映されます。' });
      } catch(e) { sendJSON(res, 500, { success: false, error: '公開に失敗', details: e.stderr ? e.stderr.toString() : e.message }); }
      return;
    }

    // ========== ステータス ==========
    if (pathname === '/api/status' && req.method === 'GET') {
      let gitStatus = ''; try { gitStatus = execSync('git status --short', { cwd: BLOG_DIR }).toString().trim(); } catch(e) {}
      const postCount = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md')).length;
      const fd = readJSON('followers.json') || { count: 0 };
      sendJSON(res, 200, { blogDir: BLOG_DIR, postCount, hasChanges: gitStatus.length > 0, gitStatus, siteUrl: 'https://mebae-california.com', followerCount: fd.count }); return;
    }

    // ========== カテゴリー管理 ==========
    if (pathname === '/api/categories' && req.method === 'GET') {
      const categories = readCategoriesFromToml();
      sendJSON(res, 200, { success: true, categories });
      return;
    }

    if (pathname === '/api/categories' && req.method === 'POST') {
      const raw = await readBody(req);
      const data = JSON.parse(raw.toString('utf-8'));
      if (!data.categories || !Array.isArray(data.categories)) {
        sendJSON(res, 400, { success: false, error: 'categories配列が必要です' });
        return;
      }
      writCategoriesToToml(data.categories);
      sendJSON(res, 200, { success: true, message: 'カテゴリーを保存しました' });
      return;
    }

    // ========== 画像ファイル配信（サムネイル用） ==========
    if (pathname.startsWith('/images/')) {
      const filePath = path.join(BLOG_DIR, 'static', pathname);
      if (fs.existsSync(filePath)) {
        const ext = path.extname(filePath).toLowerCase();
        const mimeMap = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.heic': 'image/heic' };
        const mime = mimeMap[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': mime, 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-cache' });
        fs.createReadStream(filePath).pipe(res);
      } else {
        res.writeHead(404, { 'Access-Control-Allow-Origin': '*' });
        res.end('Not found');
      }
      return;
    }

    sendJSON(res, 404, { error: 'Not Found' });
  } catch (err) { console.error('Error:', err); sendJSON(res, 500, { error: err.message }); }
}

// === Multipart parser ===
function parseMultipart(buffer, boundary) {
  const parts = []; const bb = Buffer.from('--' + boundary);
  let start = buffer.indexOf(bb) + bb.length + 2;
  while (start < buffer.length) {
    const next = buffer.indexOf(bb, start); if (next === -1) break;
    const pd = buffer.slice(start, next - 2);
    const he = pd.indexOf('\r\n\r\n');
    if (he === -1) { start = next + bb.length + 2; continue; }
    const hs = pd.slice(0, he).toString('utf-8'); const body = pd.slice(he + 4);
    const nm = hs.match(/name="([^"]+)"/); const fn = hs.match(/filename="([^"]+)"/);
    if (nm) { const p = { name: nm[1] }; if (fn) { p.filename = fn[1]; p.data = body; } else { p.value = body.toString('utf-8'); } parts.push(p); }
    start = next + bb.length + 2;
  }
  return parts;
}

const server = http.createServer(handleRequest);
server.listen(PORT, () => { console.log(`\n🌸 めばえブログ管理API v2 → http://localhost:${PORT}\n`); });
