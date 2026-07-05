/**
 * api.js — Thin fetch wrapper for the kS2 backend.
 *
 * In development: requests go to /api (Vite proxies to localhost:4000)
 * In production:  requests go to VITE_API_URL (Render backend URL)
 */

// Backend API base URL.
// VITE_API_URL is set in Render's environment variables and baked in at build time.
// The hardcoded fallback ensures production always hits the correct backend
// even if the env var is missing from the build.
const BASE = import.meta.env.VITE_API_URL
  || 'https://sewingcirclebackend.onrender.com/api';

function getToken() {
  return sessionStorage.getItem('sc_token');
}

async function request(method, path, body, opts = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    ...opts,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || 'Request failed'), { status: res.status, data });
  return data;
}

// Multipart upload (no JSON Content-Type)
async function upload(method, path, formData) {
  const token = getToken();
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { method, headers, body: formData });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || 'Upload failed'), { status: res.status, data });
  return data;
}

export const api = {
  get:    (path)           => request('GET',    path),
  post:   (path, body)     => request('POST',   path, body),
  patch:  (path, body)     => request('PATCH',  path, body),
  put:    (path, body)     => request('PUT',    path, body),
  delete: (path)           => request('DELETE', path),
  upload: (path, formData) => upload('POST', path, formData),

  // ── Auth ──────────────────────────────────────────────────────────────────
  auth: {
    login:          (email, password)        => request('POST', '/auth/login', { email, password }),
    changePassword: (mfaToken, newPassword)  => request('POST', '/auth/change-password', { mfaToken, newPassword }),
    verifyTotp:     (mfaToken, totpCode)     => request('POST', '/auth/verify-totp', { mfaToken, totpCode }),
    setupTotp:      (mfaToken)               => request('POST', '/auth/setup-totp', { mfaToken }),
    confirmTotp:    (mfaToken, totpCode)     => request('POST', '/auth/confirm-totp', { mfaToken, totpCode }),
    requestOtp:     (email)                  => request('POST', '/auth/request-otp', { email }),
    verifyOtp:      (email, otp)             => request('POST', '/auth/verify-otp', { email, otp }),
    logout:         ()                       => request('POST', '/auth/logout'),
    me:             (opts)                   => request('GET',  '/auth/me', undefined, opts),
    createClient:   (name, email)            => request('POST', '/auth/clients', { name, email }),
    listClients:    ()                       => request('GET',  '/auth/clients'),
    toggleClient:   (id)                     => request('PATCH', `/auth/clients/${id}/toggle`),
    deleteClient:   (id)                     => request('DELETE', `/auth/clients/${id}`),
  },

  // ── Candidates ────────────────────────────────────────────────────────────
  candidates: {
    list:        ()                   => request('GET',    '/candidates'),
    get:         (id)                 => request('GET',    `/candidates/${id}`),
    create:      (data)               => request('POST',   '/candidates', data),
    update:      (id, data)           => request('PATCH',  `/candidates/${id}`, data),
    delete:      (id)                 => request('DELETE', `/candidates/${id}`),
    share:       (id, clientUserId, action) =>
      request('PATCH', `/candidates/${id}/share`, { clientUserId, action }),
    uploadResume: (id, file) => {
      const fd = new FormData(); fd.append('resume', file);
      return upload('POST', `/candidates/${id}/resume`, fd);
    },
  },

  // ── Jobs ──────────────────────────────────────────────────────────────────
  jobs: {
    list:   ()         => request('GET',    '/jobs'),
    create: (data)     => request('POST',   '/jobs', data),
    update: (id, data) => request('PATCH',  `/jobs/${id}`, data),
    delete: (id)       => request('DELETE', `/jobs/${id}`),
  },

  // ── Events ────────────────────────────────────────────────────────────────
  events: {
    list:        ()         => request('GET',    '/events'),
    listPublic:  ()         => request('GET',    '/events/public'),
    create:      (data)     => request('POST',   '/events', data),
    update:      (id, data) => request('PATCH',  `/events/${id}`, data),
    delete:      (id)       => request('DELETE', `/events/${id}`),
    uploadImage: (id, file, caption) => {
      const fd = new FormData(); fd.append('image', file); fd.append('caption', caption || '');
      return upload('POST', `/events/${id}/images`, fd);
    },
    deleteImage: (id, publicId) => request('DELETE', `/events/${id}/images/${encodeURIComponent(publicId)}`),
  },

  // ── Audit ─────────────────────────────────────────────────────────────────
  audit: {
    list: (page = 1, limit = 50) => request('GET', `/audit?page=${page}&limit=${limit}`),
  },

  // ── Users (admin only) ────────────────────────────────────────────────────
  users: {
    list:          ()                   => request('GET',    '/users'),
    create:        (data)               => request('POST',   '/users', data),
    update:        (id, data)           => request('PATCH',  `/users/${id}`, data),
    toggle:        (id)                 => request('PATCH',  `/users/${id}/toggle`),
    resetPassword: (id, password)       => request('PATCH',  `/users/${id}/reset-password`, { password }),
    delete:        (id)                 => request('DELETE', `/users/${id}`),
  },
};
