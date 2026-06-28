/* ============================================================
   INKWELL — Auth State Module
   Manages user session, nav state, and persisted user data.
   ============================================================ */

const AuthState = {
  user: null,

  // Load user from localStorage cache
  loadCached() {
    try {
      const raw = localStorage.getItem('inkwell_user');
      if (raw) this.user = JSON.parse(raw);
    } catch { this.user = null; }
  },

  save(user) {
    this.user = user;
    localStorage.setItem('inkwell_user', JSON.stringify(user));
  },

  clear() {
    this.user = null;
    localStorage.removeItem('inkwell_user');
  },

  isLoggedIn() {
    return API.Auth.isLoggedIn() && !!this.user;
  },

  // Fetch fresh profile from server and cache it
  async refresh() {
    if (!API.Auth.isLoggedIn()) return null;
    try {
      const user = await API.Auth.getMe();
      this.save(user);
      return user;
    } catch {
      return null;
    }
  },

  // Called on every page — hydrate nav and check login
  async init() {
    this.loadCached();
    updateNav();

    // If logged in but no cached user, fetch it
    if (API.Auth.isLoggedIn() && !this.user) {
      await this.refresh();
      updateNav();
    }
  },
};

// ── Nav rendering ──
function updateNav() {
  const navAuth = document.getElementById('nav-auth');
  const navUser = document.getElementById('nav-user');
  const navAvatarWrap = document.getElementById('nav-avatar-wrap');

  if (!navAuth || !navUser) return;

  if (AuthState.isLoggedIn()) {
    navAuth.classList.add('hidden');
    navUser.classList.remove('hidden');

    // Build avatar or initial
    navAvatarWrap.innerHTML = '';
    if (AuthState.user.avatar) {
      const img = document.createElement('img');
      img.className = 'avatar-sm';
      img.src = AuthState.user.avatar.startsWith('http')
        ? AuthState.user.avatar
        : `http://127.0.0.1:8000${AuthState.user.avatar}`;
      img.alt = AuthState.user.username;
      navAvatarWrap.appendChild(img);
    } else {
      const ph = document.createElement('div');
      ph.className = 'avatar-placeholder';
      ph.textContent = (AuthState.user.username || 'U')[0].toUpperCase();
      navAvatarWrap.appendChild(ph);
    }

    // Append dropdown
    const dropdown = document.getElementById('nav-dropdown') || buildDropdown();
    navAvatarWrap.appendChild(dropdown);

    // Toggle dropdown on click
    navAvatarWrap.onclick = (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('open');
    };
    document.addEventListener('click', () => dropdown.classList.remove('open'), { once: false });
  } else {
    navAuth.classList.remove('hidden');
    navUser.classList.add('hidden');
  }

  // Hide write / bookmarks links for guests
  const navWrite = document.getElementById('nav-write');
  const navBookmarks = document.getElementById('nav-bookmarks');
  if (!AuthState.isLoggedIn()) {
    navWrite?.classList.add('hidden');
    navBookmarks?.classList.add('hidden');
  }

  // Show/hide auth CTA sidebar block
  const sidebarAuthCta = document.getElementById('sidebar-auth-cta');
  if (sidebarAuthCta) {
    if (AuthState.isLoggedIn()) sidebarAuthCta.classList.add('hidden');
    else sidebarAuthCta.classList.remove('hidden');
  }
}

function buildDropdown() {
  const el = document.createElement('div');
  el.className = 'dropdown';
  el.id = 'nav-dropdown';
  el.innerHTML = `
    <a href="/pages/profile.html" class="dropdown-item">My Profile</a>
    <a href="/pages/write.html" class="dropdown-item">New Post</a>
    <hr class="dropdown-divider"/>
    <button class="dropdown-item danger" id="btn-logout">Sign out</button>
  `;
  el.querySelector('#btn-logout').addEventListener('click', handleLogout);
  return el;
}

async function handleLogout() {
  await API.Auth.logout();
  AuthState.clear();
  UI.toast('Signed out successfully', 'success');
  setTimeout(() => window.location.href = '/index.html', 600);
}

// Wire logout button (if it exists on the page statically)
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-logout')?.addEventListener('click', handleLogout);
});

window.AuthState = AuthState;
window.updateNav = updateNav;