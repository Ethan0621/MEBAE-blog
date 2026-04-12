// めばえのカリフォルニアブログ - JavaScript

document.addEventListener('DOMContentLoaded', function () {
  // ===== ハンバーガーメニュー =====
  const menuToggle = document.querySelector('.menu-toggle');
  const siteNav = document.querySelector('.site-nav');

  if (menuToggle && siteNav) {
    menuToggle.addEventListener('click', function () {
      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', !isExpanded);
      siteNav.classList.toggle('active');
    });

    // メニュー外クリックで閉じる
    document.addEventListener('click', function (e) {
      if (!menuToggle.contains(e.target) && !siteNav.contains(e.target)) {
        menuToggle.setAttribute('aria-expanded', 'false');
        siteNav.classList.remove('active');
      }
    });
  }

  // ===== 画像の遅延読み込み（ネイティブ対応） =====
  const lazyImages = document.querySelectorAll('img[loading="lazy"]');
  if ('loading' in HTMLImageElement.prototype) {
    // ブラウザがネイティブ対応
  } else {
    // フォールバック: Intersection Observer
    const imageObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          imageObserver.unobserve(img);
        }
      });
    });
    lazyImages.forEach(function (img) {
      imageObserver.observe(img);
    });
  }

  // ===== 外部リンクを新しいタブで開く =====
  const postContent = document.querySelector('.post-content');
  if (postContent) {
    const links = postContent.querySelectorAll('a[href^="http"]');
    links.forEach(function (link) {
      if (!link.hostname.includes(window.location.hostname)) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      }
    });
  }

  // ===== スクロール時のヘッダースタイル =====
  const header = document.querySelector('.site-header');
  let lastScroll = 0;

  window.addEventListener('scroll', function () {
    const currentScroll = window.pageYOffset;
    if (currentScroll > 100) {
      header.style.boxShadow = '0 2px 16px rgba(0,0,0,0.1)';
    } else {
      header.style.boxShadow = '0 1px 8px rgba(0,0,0,0.06)';
    }
    lastScroll = currentScroll;
  }, { passive: true });

  // ===== 目次のスムーズスクロール =====
  const tocLinks = document.querySelectorAll('.toc a');
  tocLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const headerHeight = header ? header.offsetHeight : 0;
        const top = targetEl.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  // ===== ライトボックス（画像拡大表示） =====
  const lightboxOverlay = document.createElement('div');
  lightboxOverlay.className = 'lightbox-overlay';
  lightboxOverlay.innerHTML = '<button class="lightbox-close" aria-label="閉じる">&times;</button><img src="" alt="">';
  document.body.appendChild(lightboxOverlay);

  const lightboxImg = lightboxOverlay.querySelector('img');
  const lightboxClose = lightboxOverlay.querySelector('.lightbox-close');

  // ギャラリー画像クリックで拡大
  document.querySelectorAll('.photo-gallery .blog-image img').forEach(function (img) {
    img.addEventListener('click', function () {
      lightboxImg.src = this.src;
      lightboxImg.alt = this.alt;
      lightboxOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  // クリックで閉じる
  lightboxOverlay.addEventListener('click', function () {
    lightboxOverlay.classList.remove('active');
    document.body.style.overflow = '';
  });

  lightboxClose.addEventListener('click', function (e) {
    e.stopPropagation();
    lightboxOverlay.classList.remove('active');
    document.body.style.overflow = '';
  });

  // Escキーで閉じる
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lightboxOverlay.classList.contains('active')) {
      lightboxOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
});
