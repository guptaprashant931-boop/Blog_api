/* ============================================================
   INKWELL — API Module
   All communication with the Django REST backend.
   Base URL: http://127.0.0.1:8000/api
   ============================================================ */

const API_BASE = 'http://127.0.0.1:8000/api';

// ── Token helpers ──
const getAccess  = () => localStorage.getItem('inkwell_access');
const getRefresh = () => localStorage.getItem('inkwell_refresh');
const setTokens  = (access, refresh) => {
  localStorage.setItem('inkwell_access', access);
  if (refresh) localStorage.setItem('inkwell_refresh', refresh);
};
const clearTokens = () => {
  localStorage.removeItem('inkwell_access');
  localStorage.removeItem('inkwell_refresh');
  localStorage.removeItem('inkwell_user');
};

// ── Core fetch wrapper ──
async function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getAccess();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  // Try to refresh if 401
  if (res.status === 401 && getRefresh()) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${getAccess()}`;
      const retry = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
      });
      return handleResponse(retry);
    } else {
      clearTokens();
      window.location.href = '/pages/login.html';
      return;
    }
  }

  return handleResponse(res);
}

async function handleResponse(res) {
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const err = new Error(extractError(data) || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

function extractError(data) {
  if (!data) return null;
  if (typeof data === 'string') return data;
  if (data.detail) return data.detail;
  if (data.non_field_errors) return data.non_field_errors[0];
  // Collect field errors
  const msgs = [];
  for (const [key, val] of Object.entries(data)) {
    if (Array.isArray(val)) msgs.push(`${key}: ${val[0]}`);
    else if (typeof val === 'string') msgs.push(val);
  }
  return msgs.join(' | ') || null;
}

async function tryRefresh() {
  try {
    const res = await fetch(`${API_BASE}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: getRefresh() }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    setTokens(data.access);
    return true;
  } catch { return false; }
}

// ── MULTIPART fetch (for file uploads) ──
async function apiFormData(path, formData, method = 'PATCH') {
  const headers = {};
  const token = getAccess();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { method, headers, body: formData });
  return handleResponse(res);
}

// ============================================================
// AUTH
// ============================================================
const Auth = {
  register: (data) => apiFetch('/auth/register/', { method: 'POST', body: data }),

  login: async (data) => {
    const res = await apiFetch('/auth/login/', { method: 'POST', body: data });
    setTokens(res.access, res.refresh);
    return res;
  },

  logout: async () => {
    try {
      await apiFetch('/auth/logout/', { method: 'POST', body: { refresh: getRefresh() } });
    } catch { /* ignore */ }
    clearTokens();
  },

  getMe: () => apiFetch('/users/me/'),

  updateMe: (data) => {
    if (data instanceof FormData) return apiFormData('/users/me/', data);
    return apiFetch('/users/me/', { method: 'PATCH', body: data });
  },

  changePassword: (data) => apiFetch('/auth/password/change/', { method: 'POST', body: data }),

  getProfile: (username) => apiFetch(`/users/${username}/`),

  isLoggedIn: () => !!getAccess(),
};

// ============================================================
// POSTS
// ============================================================
const Posts = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/posts/${qs ? '?' + qs : ''}`);
  },

  get: (slug) => apiFetch(`/posts/${slug}/`),

  create: (data) => apiFetch('/posts/', { method: 'POST', body: data }),

  update: (slug, data) => apiFetch(`/posts/${slug}/`, { method: 'PATCH', body: data }),

  delete: (slug) => apiFetch(`/posts/${slug}/`, { method: 'DELETE' }),

  myDrafts: () => apiFetch('/posts/my-drafts/'),

  categories: () => apiFetch('/categories/'),

  tags: () => apiFetch('/tags/'),

  createCategory: (data) => apiFetch('/categories/', { method: 'POST', body: data }),

  createTag: (data) => apiFetch('/tags/', { method: 'POST', body: data }),
};

// ============================================================
// COMMENTS
// ============================================================
const Comments = {
  list: (slug) => apiFetch(`/posts/${slug}/comments/`),

  create: (slug, body, parent = null) =>
    apiFetch(`/posts/${slug}/comments/`, {
      method: 'POST',
      body: parent ? { body, parent } : { body },
    }),

  update: (slug, id, body) =>
    apiFetch(`/posts/${slug}/comments/${id}/`, { method: 'PATCH', body: { body } }),

  delete: (slug, id) =>
    apiFetch(`/posts/${slug}/comments/${id}/`, { method: 'DELETE' }),
};

// ============================================================
// INTERACTIONS
// ============================================================
const Interactions = {
  like: (slug) => apiFetch(`/posts/${slug}/like/`, { method: 'POST' }),

  bookmark: (slug) => apiFetch(`/posts/${slug}/bookmark/`, { method: 'POST' }),

  myBookmarks: () => apiFetch('/users/me/bookmarks/'),
};

// ── Export ──
window.API = { Auth, Posts, Comments, Interactions, getAccess, clearTokens };