/* ============================================================
   INKWELL — UI Utilities
   ============================================================ */

const UI = {
  // ── Toast notifications ──
  toast(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = { success: '✓', error: '✕', info: '·' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${icons[type] || '·'}</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 400);
    }, duration);
  },

  // ── Format date ──
  formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  },

  formatRelative(dateStr) {
    if (!dateStr) return '';
    const now = new Date();
    const d = new Date(dateStr);
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60)  return 'just now';
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff/86400)}d ago`;
    return UI.formatDate(dateStr);
  },

  // ── Avatar URL ──
  avatarUrl(user) {
    if (!user) return '';
    if (user.avatar) {
      return user.avatar.startsWith('http')
        ? user.avatar
        : `http://127.0.0.1:8000${user.avatar}`;
    }
    return '';
  },

  // ── Avatar element (img or placeholder letter) ──
  avatarEl(user, size = 'sm') {
    const sizes = { sm: '28px', md: '40px', lg: '64px' };
    const sz = sizes[size] || '28px';
    const cls = `post-author-avatar`;

    if (UI.avatarUrl(user)) {
      return `<img class="${cls}" src="${UI.avatarUrl(user)}" alt="${user.username}" style="width:${sz};height:${sz};" />`;
    }
    const letter = (user.username || 'U')[0].toUpperCase();
    return `<div class="${cls}" style="width:${sz};height:${sz};border-radius:50%;background:var(--accent);color:#fff;display:flex;align-items:center;justify-content:center;font-family:'DM Serif Display',serif;font-size:${size==='sm'?'11px':'14px'};flex-shrink:0;">${letter}</div>`;
  },

  // ── Truncate ──
  truncate(str, len = 160) {
    if (!str || str.length <= len) return str || '';
    return str.slice(0, len).trimEnd() + '…';
  },

  // ── Escape HTML ──
  esc(str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
  },

  // ── Build post card HTML ──
  postCard(post, options = {}) {
    const { showDraft = false } = options;
    const isDraft = post.status === 'draft';
    const date = post.published_at || post.created_at;

    return `
      <article class="post-card" data-slug="${post.slug}">
        <div class="post-card-meta">
          ${UI.avatarEl(post.author, 'sm')}
          <span class="post-card-author-name">${UI.esc(post.author?.username || '')}</span>
          ${isDraft && showDraft ? '<span class="draft-badge">Draft</span>' : ''}
          ${post.category ? `<span class="post-card-category">${UI.esc(post.category.name)}</span>` : ''}
          <span class="post-card-date">${UI.formatDate(date)}</span>
        </div>

        <h2 class="post-card-title" onclick="goToPost('${post.slug}')">
          ${UI.esc(post.title)}
        </h2>

        ${post.content ? `
          <p class="post-card-excerpt">${UI.esc(UI.truncate(post.content))}</p>
        ` : ''}

        ${post.tags?.length ? `
          <div class="post-card-tags">
            ${post.tags.map(t => `<span class="tag-chip">#${UI.esc(t.name)}</span>`).join('')}
          </div>
        ` : ''}

        <div class="post-card-footer">
          <span class="post-stat">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6">
              <path d="M3 10a7 7 0 1014 0 7 7 0 00-14 0z"/>
              <path d="M10 7v6M7 10h6"/>
            </svg>
            ${post.like_count ?? 0}
          </span>
          <span class="post-stat">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6">
              <path d="M17 9A7 7 0 003 9c0 3 1.5 5.5 4 7l3 1 3-1c2.5-1.5 4-4 4-7z"/>
            </svg>
            ${post.comment_count ?? 0}
          </span>
          <a class="post-card-read" onclick="goToPost('${post.slug}')">Read →</a>
        </div>
      </article>`;
  },

  // ── Set button loading state ──
  setLoading(btn, loading, text = '') {
    if (!btn) return;
    if (loading) {
      btn.dataset.origText = btn.textContent;
      btn.disabled = true;
      btn.innerHTML = `<span class="spinner"></span>`;
    } else {
      btn.disabled = false;
      btn.textContent = text || btn.dataset.origText || btn.textContent;
    }
  },

  // ── Empty state ──
  emptyState(icon, title, desc, action = '') {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">${icon}</div>
        <p class="empty-state-title">${title}</p>
        <p class="empty-state-desc">${desc}</p>
        ${action}
      </div>`;
  },

  // ── Form validation helper ──
  getFieldError(data, field) {
    if (!data) return '';
    if (data[field]) {
      return Array.isArray(data[field]) ? data[field][0] : data[field];
    }
    return '';
  },

  showFieldError(inputEl, msgEl, msg) {
    if (inputEl) inputEl.classList.toggle('error', !!msg);
    if (msgEl) msgEl.textContent = msg || '';
  },
};

// Navigate to post detail page
function goToPost(slug) {
  window.location.href = `/pages/post.html?slug=${slug}`;
}

window.UI = UI;
window.goToPost = goToPost;