// ============================================
// 🌸 めばえブログ ソーシャル機能
// ============================================
// いいね・コメント・フォロー・アクセス解析
// ============================================

(function() {
  const API = window.MEBAE_API || 'https://mebae-california.com';
  // ローカルではadmin-server、本番ではNetlify Functionsなどを想定
  // 開発時はlocalhost:3001にフォールバック
  const API_BASE = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
    ? 'http://localhost:3001' : '';

  // === アクセス記録 ===
  if (API_BASE) {
    fetch(API_BASE + '/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: location.pathname, referrer: document.referrer }),
    }).catch(() => {});
  }

  // === いいねボタン ===
  const likeBtn = document.getElementById('likeBtn');
  const likeCount = document.getElementById('likeCount');
  const slug = document.querySelector('meta[name="post-slug"]');
  const postSlug = slug ? slug.content : null;

  if (likeBtn && postSlug && API_BASE) {
    // 現在のいいね数を取得
    fetch(API_BASE + '/api/likes?slug=' + postSlug)
      .then(r => r.json())
      .then(data => { if (likeCount) likeCount.textContent = data.count || 0; })
      .catch(() => {});

    // ローカルストレージでいいね済みチェック
    const likedPosts = JSON.parse(localStorage.getItem('mebae_liked') || '[]');
    if (likedPosts.includes(postSlug)) {
      likeBtn.classList.add('liked');
      likeBtn.querySelector('.like-icon').textContent = '❤️';
    }

    likeBtn.addEventListener('click', function() {
      if (likedPosts.includes(postSlug)) {
        showSocialToast('すでにいいね済みです 💕');
        return;
      }
      fetch(API_BASE + '/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: postSlug }),
      })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          likeCount.textContent = data.count;
          likeBtn.classList.add('liked');
          likeBtn.querySelector('.like-icon').textContent = '❤️';
          likedPosts.push(postSlug);
          localStorage.setItem('mebae_liked', JSON.stringify(likedPosts));
          showSocialToast('いいねしました！ 💕');
        }
      })
      .catch(() => showSocialToast('エラーが発生しました', true));
    });
  }

  // === コメント機能 ===
  const commentForm = document.getElementById('commentForm');
  const commentsList = document.getElementById('commentsList');
  const commentCount = document.getElementById('commentCount');

  if (commentForm && postSlug && API_BASE) {
    // コメント一覧を取得
    loadComments();

    commentForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const name = document.getElementById('commentName').value.trim();
      const message = document.getElementById('commentMessage').value.trim();
      if (!name || !message) { showSocialToast('お名前とコメントを入力してください', true); return; }

      const submitBtn = commentForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = '送信中...';

      fetch(API_BASE + '/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: postSlug, name, message }),
      })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          document.getElementById('commentMessage').value = '';
          // 名前はlocalStorageに保存
          localStorage.setItem('mebae_comment_name', name);
          loadComments();
          showSocialToast('コメントありがとうございます！ 💬');
        }
      })
      .catch(() => showSocialToast('送信に失敗しました', true))
      .finally(() => { submitBtn.disabled = false; submitBtn.textContent = '💬 コメントする'; });
    });

    // 保存された名前を復元
    const savedName = localStorage.getItem('mebae_comment_name');
    if (savedName) document.getElementById('commentName').value = savedName;
  }

  function loadComments() {
    if (!commentsList || !postSlug || !API_BASE) return;
    fetch(API_BASE + '/api/comments?slug=' + postSlug)
      .then(r => r.json())
      .then(data => {
        const list = data.comments || [];
        if (commentCount) commentCount.textContent = list.length;
        if (list.length === 0) {
          commentsList.innerHTML = '<p class="no-comments">まだコメントはありません。最初のコメントを書いてみませんか？ 😊</p>';
          return;
        }
        commentsList.innerHTML = list.map(c => {
          const d = new Date(c.date);
          const dateStr = d.getFullYear() + '年' + (d.getMonth()+1) + '月' + d.getDate() + '日 ' + d.getHours() + ':' + String(d.getMinutes()).padStart(2,'0');
          return '<div class="comment-item"><div class="comment-header"><span class="comment-author">🧑 ' + escapeHtml(c.name) + '</span><span class="comment-date">' + dateStr + '</span></div><p class="comment-body">' + escapeHtml(c.message) + '</p></div>';
        }).join('');
      })
      .catch(() => {});
  }

  // === フォロー機能（Netlify Forms対応） ===
  const followForm = document.getElementById('followForm');
  const followFormArea = document.getElementById('followFormArea');
  const followerCountEl = document.getElementById('followerCount');

  // フォロワー数を取得
  if (followerCountEl) {
    fetch('/.netlify/functions/follower-count')
      .then(function(r) { return r.json(); })
      .then(function(data) {
        followerCountEl.textContent = data.count || 0;
      })
      .catch(function() {
        followerCountEl.textContent = '0';
      });
  }

  // 既にフォロー済みならUIを更新
  function updateFollowUI() {
    if (!followFormArea) return;
    if (localStorage.getItem('mebae_following') === 'true') {
      followFormArea.innerHTML = '<p class="follow-thanks">🌸 フォロー中です！ありがとうございます。<br><button type="button" class="unfollow-btn" onclick="unfollowBlog()">フォロー解除</button></p>';
    }
  }

  if (followForm) {
    followForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var email = document.getElementById('followEmail').value.trim();
      var name = document.getElementById('followName') ? document.getElementById('followName').value.trim() : '';
      if (!email) { showSocialToast('メールアドレスを入力してください', true); return; }

      // Netlify Formsへ送信
      var formData = new URLSearchParams();
      formData.append('form-name', 'follow');
      formData.append('email', email);
      formData.append('name', name);

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      })
      .then(function(response) {
        if (response.ok) {
          showSocialToast('フォローありがとうございます！🌸');
          localStorage.setItem('mebae_following', 'true');
          localStorage.setItem('mebae_follow_email', email);
          // フォロワー数を+1
          if (followerCountEl) {
            var current = parseInt(followerCountEl.textContent) || 0;
            followerCountEl.textContent = current + 1;
          }
          updateFollowUI();
        } else {
          showSocialToast('送信に失敗しました。もう一度お試しください。', true);
        }
      })
      .catch(function() { showSocialToast('送信に失敗しました。', true); });
    });

    updateFollowUI();
  }

  // グローバルに公開
  window.unfollowBlog = function() {
    localStorage.removeItem('mebae_following');
    localStorage.removeItem('mebae_follow_email');
    showSocialToast('フォローを解除しました');
    location.reload();
  };

  // === ヘルパー ===
  function escapeHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function showSocialToast(msg, isError) {
    let toast = document.getElementById('socialToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'socialToast';
      toast.style.cssText = 'position:fixed;bottom:24px;right:24px;padding:14px 24px;border-radius:10px;font-weight:bold;z-index:9999;display:none;animation:fadeIn 0.3s;max-width:400px;font-size:0.95rem;';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.background = isError ? '#e74c3c' : '#4caf50';
    toast.style.color = 'white';
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 3000);
  }
})();
