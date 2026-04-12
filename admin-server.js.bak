#!/usr/bin/env node
// ============================================
// 🌸 めばえブログ 管理APIサーバー
// ============================================
// 記事の作成・編集・画像アップロード・公開を
// ブラウザの管理画面からすべて行えるAPIサーバー
// ============================================

const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PORT = 3001;
const BLOG_DIR = __dirname;
const CONTENT_DIR = path.join(BLOG_DIR, 'content', 'posts');
const IMAGES_DIR = path.join(BLOG_DIR, 'static', 'images');

// === ヘルパー関数 ===

function parseFrontMatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: content };

  const metaStr = match[1];
  const body = match[2];
  const meta = {};

  metaStr.split('\n').forEach(line => {
    const m = line.match(/^(\w+):\s*(.*)$/);
    if (m) {
      let val = m[2].trim();
      // Parse arrays like ["tag1", "tag2"]
      if (val.startsWith('[') && val.endsWith(']')) {
        try {
          val = JSON.parse(val.replace(/'/g, '"'));
        } catch(e) {
          val = val.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
        }
      }
      // Remove quotes
      if (typeof val === 'string') {
        val = val.replace(/^["']|["']$/g, '');
      }
      meta[m[1]] = val;
    }
  });

  return { meta, body };
}

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
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
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function generateSlug(title) {
  // ローマ字・英数字のみ残す、日本語はハイフンに
  let slug = title
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  if (!slug) {
    slug = 'post-' + new Date().toISOString().slice(0, 10);
  }
  return slug;
}

// === APIルーティング ===

async function handleRequest(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  try {
    // --- 記事一覧を取得 ---
    if (pathname === '/api/posts' && req.method === 'GET') {
      const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));
      const posts = files.map(file => {
        const content = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf-8');
        const { meta, body } = parseFrontMatter(content);
        return {
          filename: file,
          slug: file.replace('.md', ''),
          title: meta.title || file,
          date: meta.date || '',
          draft: meta.draft === 'true' || meta.draft === true,
          categories: Array.isArray(meta.categories) ? meta.categories : (meta.categories ? [meta.categories] : []),
          tags: Array.isArray(meta.tags) ? meta.tags : (meta.tags ? [meta.tags] : []),
          description: meta.description || '',
          bodyPreview: body.trim().substring(0, 100) + '...',
        };
      });
      // 日付の新しい順にソート
      posts.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      sendJSON(res, 200, { posts });
      return;
    }

    // --- 記事1件を取得 ---
    if (pathname.startsWith('/api/posts/') && req.method === 'GET') {
      const slug = pathname.replace('/api/posts/', '');
      const filePath = path.join(CONTENT_DIR, slug + '.md');
      if (!fs.existsSync(filePath)) {
        sendJSON(res, 404, { error: '記事が見つかりません' });
        return;
      }
      const content = fs.readFileSync(filePath, 'utf-8');
      const { meta, body } = parseFrontMatter(content);
      sendJSON(res, 200, {
        filename: slug + '.md',
        slug,
        title: meta.title || '',
        date: meta.date || '',
        draft: meta.draft === 'true' || meta.draft === true,
        categories: Array.isArray(meta.categories) ? meta.categories : (meta.categories ? [meta.categories] : []),
        tags: Array.isArray(meta.tags) ? meta.tags : (meta.tags ? [meta.tags] : []),
        description: meta.description || '',
        image: meta.image || '',
        body: body.trim(),
        raw: content,
      });
      return;
    }

    // --- 記事を保存（新規 or 更新） ---
    if (pathname === '/api/posts' && req.method === 'POST') {
      const rawBody = await readBody(req);
      const data = JSON.parse(rawBody.toString('utf-8'));

      const title = data.title || '無題の記事';
      const slug = data.slug || generateSlug(title);
      const date = data.date || new Date().toISOString().split('T')[0];
      const draft = data.draft !== undefined ? data.draft : false;
      const categories = data.categories || [];
      const tags = data.tags || [];
      const description = data.description || '';
      const image = data.image || '';
      const body = data.body || '';

      const tagsYaml = tags.map(t => `"${t}"`).join(', ');
      const categoriesYaml = categories.map(c => `"${c}"`).join(', ');

      const markdown = `---
title: "${title}"
date: ${date}
draft: ${draft}
categories: [${categoriesYaml}]
tags: [${tagsYaml}]
description: "${description}"
image: "${image}"
---

${body}
`;

      const filePath = path.join(CONTENT_DIR, slug + '.md');
      const isNew = !fs.existsSync(filePath);
      fs.writeFileSync(filePath, markdown, 'utf-8');

      sendJSON(res, 200, {
        success: true,
        message: isNew ? '記事を作成しました' : '記事を更新しました',
        slug,
        filename: slug + '.md',
      });
      return;
    }

    // --- 記事を削除 ---
    if (pathname.startsWith('/api/posts/') && req.method === 'DELETE') {
      const slug = pathname.replace('/api/posts/', '');
      const filePath = path.join(CONTENT_DIR, slug + '.md');
      if (!fs.existsSync(filePath)) {
        sendJSON(res, 404, { error: '記事が見つかりません' });
        return;
      }
      fs.unlinkSync(filePath);
      sendJSON(res, 200, { success: true, message: '記事を削除しました' });
      return;
    }

    // --- 画像アップロード ---
    if (pathname === '/api/images' && req.method === 'POST') {
      const rawBody = await readBody(req);
      const contentType = req.headers['content-type'] || '';

      if (contentType.includes('multipart/form-data')) {
        // multipart/form-data をパース
        const boundary = contentType.split('boundary=')[1];
        const parts = parseMultipart(rawBody, boundary);

        const folder = parts.find(p => p.name === 'folder');
        const folderName = folder ? folder.value : 'uploads';
        const targetDir = path.join(IMAGES_DIR, folderName);

        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }

        const uploaded = [];
        parts.filter(p => p.filename).forEach(part => {
          const filePath = path.join(targetDir, part.filename);
          fs.writeFileSync(filePath, part.data);
          uploaded.push({
            filename: part.filename,
            path: `/images/${folderName}/${part.filename}`,
            size: part.data.length,
          });
        });

        sendJSON(res, 200, { success: true, uploaded });
      } else {
        sendJSON(res, 400, { error: '画像はmultipart/form-dataで送信してください' });
      }
      return;
    }

    // --- 画像一覧を取得 ---
    if (pathname === '/api/images' && req.method === 'GET') {
      const folderParam = url.searchParams.get('folder');
      let images = [];

      if (folderParam) {
        const dir = path.join(IMAGES_DIR, folderParam);
        if (fs.existsSync(dir)) {
          images = fs.readdirSync(dir)
            .filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))
            .map(f => ({ filename: f, path: `/images/${folderParam}/${f}` }));
        }
      } else {
        // すべてのフォルダの画像を返す
        if (fs.existsSync(IMAGES_DIR)) {
          const folders = fs.readdirSync(IMAGES_DIR).filter(f =>
            fs.statSync(path.join(IMAGES_DIR, f)).isDirectory()
          );
          folders.forEach(folder => {
            const dir = path.join(IMAGES_DIR, folder);
            fs.readdirSync(dir)
              .filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))
              .forEach(f => {
                images.push({ filename: f, folder, path: `/images/${folder}/${f}` });
              });
          });
        }
      }

      sendJSON(res, 200, { images });
      return;
    }

    // --- 公開（Git push） ---
    if (pathname === '/api/publish' && req.method === 'POST') {
      const rawBody = await readBody(req);
      let message = '記事を更新';
      try {
        const data = JSON.parse(rawBody.toString('utf-8'));
        if (data.message) message = data.message;
      } catch(e) {}

      try {
        // Hugo ビルド
        execSync('hugo --minify', { cwd: BLOG_DIR, stdio: 'pipe' });

        // Git add, commit, push
        execSync('git add -A', { cwd: BLOG_DIR, stdio: 'pipe' });

        // コミットするものがあるか確認
        try {
          const status = execSync('git status --porcelain', { cwd: BLOG_DIR }).toString().trim();
          if (!status) {
            sendJSON(res, 200, { success: true, message: '変更はありません。すでに最新です。' });
            return;
          }
        } catch(e) {}

        execSync(`git commit -m "${message} - ${new Date().toISOString().slice(0,10)}"`, { cwd: BLOG_DIR, stdio: 'pipe' });

        // PAT を使ってプッシュ
        const configPath = path.join(BLOG_DIR, '.blog-config.json');
        let pushCmd = 'git push origin main';

        if (fs.existsSync(configPath)) {
          const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
          if (config.githubToken && config.githubRepo) {
            const pushUrl = `https://${config.githubUser || 'Ethan0621'}:${config.githubToken}@github.com/${config.githubRepo}.git`;
            pushCmd = `git push ${pushUrl} main`;
          }
        }

        execSync(pushCmd, { cwd: BLOG_DIR, stdio: 'pipe' });

        sendJSON(res, 200, {
          success: true,
          message: '🎉 公開完了！ 1〜2分後にサイトに反映されます。',
        });
      } catch(e) {
        sendJSON(res, 500, {
          success: false,
          error: '公開に失敗しました',
          details: e.stderr ? e.stderr.toString() : e.message,
        });
      }
      return;
    }

    // --- サイト情報 ---
    if (pathname === '/api/status' && req.method === 'GET') {
      let gitStatus = '';
      try {
        gitStatus = execSync('git status --short', { cwd: BLOG_DIR }).toString().trim();
      } catch(e) {}

      const postCount = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md')).length;

      sendJSON(res, 200, {
        blogDir: BLOG_DIR,
        postCount,
        hasChanges: gitStatus.length > 0,
        gitStatus,
        siteUrl: 'https://mebae-california.com',
      });
      return;
    }

    // 404
    sendJSON(res, 404, { error: 'Not Found' });

  } catch (err) {
    console.error('Error:', err);
    sendJSON(res, 500, { error: err.message });
  }
}

// === Multipart parser (簡易版) ===
function parseMultipart(buffer, boundary) {
  const parts = [];
  const boundaryBuf = Buffer.from('--' + boundary);
  const endBuf = Buffer.from('--' + boundary + '--');

  let start = buffer.indexOf(boundaryBuf) + boundaryBuf.length + 2; // skip \r\n

  while (start < buffer.length) {
    const nextBoundary = buffer.indexOf(boundaryBuf, start);
    if (nextBoundary === -1) break;

    const partData = buffer.slice(start, nextBoundary - 2); // remove trailing \r\n
    const headerEnd = partData.indexOf('\r\n\r\n');
    if (headerEnd === -1) { start = nextBoundary + boundaryBuf.length + 2; continue; }

    const headerStr = partData.slice(0, headerEnd).toString('utf-8');
    const body = partData.slice(headerEnd + 4);

    const nameMatch = headerStr.match(/name="([^"]+)"/);
    const filenameMatch = headerStr.match(/filename="([^"]+)"/);

    if (nameMatch) {
      const part = { name: nameMatch[1] };
      if (filenameMatch) {
        part.filename = filenameMatch[1];
        part.data = body;
      } else {
        part.value = body.toString('utf-8');
      }
      parts.push(part);
    }

    start = nextBoundary + boundaryBuf.length + 2;
  }

  return parts;
}

// === サーバー起動 ===
const server = http.createServer(handleRequest);
server.listen(PORT, () => {
  console.log('');
  console.log('🌸 めばえブログ 管理APIサーバー');
  console.log(`   http://localhost:${PORT}`);
  console.log('');
});
