/* ============================================================
   INKWELL — Home Page
   ============================================================ */

let allPosts = [];
let categories = [];
let activeCategory = '';
let activeFilter = 'all';
let searchQuery = '';
let searchTimer = null;

async function initHome() {
  await AuthState.init();
  await loadCategories();
  await loadPosts();
  bindFilters();
}

async function loadCategories() {
  try {
    const data = await API.Posts.categories();
    categories = Array.isArray(data) ? data : (data.results || []);
    renderSidebarCategories();
    populateCategorySelect();
  } catch { /* silently skip */ }
}

function renderSidebarCategories() {
  const list = document.getElementById('sidebar-categories');
  if (!list) return;

  list.innerHTML = `
    <li class="sidebar-item active" data-cat="">
      <span>All</span>
    </li>
    ${categories.map(c => `
      <li class="sidebar-item" data-cat="${c.slug}">
        <span>${UI.esc(c.name)}</span>
      </li>
    `).join('')}
  `;

  list.querySelectorAll('.sidebar-item').forEach(item => {
    item.addEventListener('click', () => {
      activeCategory = item.dataset.cat;
      list.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      // Sync select
      const sel = document.getElementById('category-filter');
      if (sel) sel.value = activeCategory;
      renderPosts();
    });
  });
}

function populateCategorySelect() {
  const sel = document.getElementById('category-filter');
  if (!sel) return;
  categories.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.slug;
    opt.textContent = c.name;
    sel.appendChild(opt);
  });
}

async function loadPosts() {
  const skeleton = document.getElementById('skeleton-grid');
  const grid = document.getElementById('posts-grid');

  try {
    const params = {};
    if (searchQuery) params.search = searchQuery;

    const data = await API.Posts.list(params);
    allPosts = Array.isArray(data) ? data : (data.results || []);

    if (skeleton) skeleton.remove();
    renderPosts();
  } catch (err) {
    if (skeleton) skeleton.remove();
    const grid = document.getElementById('posts-grid');
    if (grid) grid.innerHTML = UI.emptyState('📡', 'Cannot reach the server',
      'Make sure the Django backend is running on port 8000.',
      `<button class="btn btn-ghost" onclick="loadPosts()">Try again</button>`);
  }
}

function renderPosts() {
  const grid = document.getElementById('posts-grid');
  if (!grid) return;

  let posts = [...allPosts];

  // Filter by category
  if (activeCategory) {
    posts = posts.filter(p => p.category?.slug === activeCategory);
  }

  // Filter by status chip
  if (activeFilter === 'published') {
    posts = posts.filter(p => p.status === 'published');
  }

  // Client-side search fallback
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    posts = posts.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.author?.username?.toLowerCase().includes(q)
    );
  }

  if (!posts.length) {
    grid.innerHTML = UI.emptyState('✍️', 'No posts yet',
      searchQuery ? 'Try different search terms.' : 'Be the first to share your ideas.',
      AuthState.isLoggedIn()
        ? `<a href="/pages/write.html" class="btn btn-primary">Write something</a>`
        : `<a href="/pages/register.html" class="btn btn-primary">Join to write</a>`
    );
    return;
  }

  grid.innerHTML = posts.map(p => UI.postCard(p)).join('');
}

function bindFilters() {
  // Filter chips
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeFilter = chip.dataset.filter;
      renderPosts();
    });
  });

  // Search input with debounce
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimer);
      searchQuery = e.target.value.trim();
      searchTimer = setTimeout(async () => {
        if (searchQuery.length > 2 || searchQuery === '') {
          await loadPosts();
        } else {
          renderPosts();
        }
      }, 380);
    });
  }

  // Category select (mobile / top bar)
  const catSel = document.getElementById('category-filter');
  if (catSel) {
    catSel.addEventListener('change', () => {
      activeCategory = catSel.value;
      // Sync sidebar
      document.querySelectorAll('#sidebar-categories .sidebar-item').forEach(item => {
        item.classList.toggle('active', item.dataset.cat === activeCategory);
      });
      renderPosts();
    });
  }
}

document.addEventListener('DOMContentLoaded', initHome);