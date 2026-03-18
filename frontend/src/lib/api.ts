const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('bd_token');
}

async function request(path: string, opts: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...opts, headers });

  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bd_token');
      localStorage.removeItem('bd_user');
      window.location.href = '/auth';
    }
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || res.statusText);
  }

  return res.json();
}

export const api = {
  register: (email: string, password: string, name?: string) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name }) }),

  login: (email: string, password: string) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  me: () => request('/auth/me'),

  // API Keys
  listKeys: () => request('/api-keys'),
  createKey: (name?: string) => request('/api-keys', { method: 'POST', body: JSON.stringify({ name }) }),
  revokeKey: (id: string) => request(`/api-keys/${id}`, { method: 'DELETE' }),

  // Validation
  validate: (email: string) =>
    request('/validate/dashboard', { method: 'POST', body: JSON.stringify({ email }) }),

  validationHistory: (limit = 50, offset = 0) =>
    request(`/validate/history?limit=${limit}&offset=${offset}`),

  validationStats: () => request('/validate/stats'),

  // Lists
  listLists: () => request('/lists'),
  getList: (id: string) => request(`/lists/${id}`),
  uploadList: async (file: File) => {
    const token = getToken();
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_URL}/lists/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) throw new Error((await res.json()).message || 'Upload failed');
    return res.json();
  },
};

export function saveAuth(data: { token: string; user: any }) {
  localStorage.setItem('bd_token', data.token);
  localStorage.setItem('bd_user', JSON.stringify(data.user));
}

export function getUser() {
  if (typeof window === 'undefined') return null;
  const s = localStorage.getItem('bd_user');
  return s ? JSON.parse(s) : null;
}

export function logout() {
  localStorage.removeItem('bd_token');
  localStorage.removeItem('bd_user');
  window.location.href = '/';
}

export function isLoggedIn(): boolean {
  return !!getToken();
}
