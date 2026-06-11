/**
 * useAuth.js — JWT session management for kS2
 *
 * Auth state machine:
 *   idle             → initial
 *   loading          → processing
 *   change_password  → first login: must set new password before proceeding
 *   step1_done       → password verified, awaiting TOTP code
 *   setup_totp       → first TOTP setup: showing QR
 *   authenticated
 *   unauthenticated
 */
import { create } from 'zustand';
import { api }    from '../utils/api';

const TOKEN_KEY = 'sc_token';

const useAuth = create((set, get) => ({
  // ── State ──────────────────────────────────────────────────────────────────
  status:         'idle',      // idle | loading | step1_done | setup_totp | authenticated | unauthenticated
  user:           null,
  mfaToken:       null,        // short-lived pre-auth token (step 1 → step 2)
  totpSetupData:  null,        // { secret, otpauthUri } from /setup-totp
  error:          null,

  // ── Restore session on app mount ──────────────────────────────────────────
  init: async () => {
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (!token) return set({ status: 'unauthenticated' });

    set({ status: 'loading' });
    try {
      // 8-second timeout — if backend is cold-starting on Render free tier
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const user = await api.auth.me({ signal: controller.signal });
      clearTimeout(timeout);
      set({ status: 'authenticated', user, error: null });
    } catch (err) {
      sessionStorage.removeItem(TOKEN_KEY);
      // Don't expose the error — just go to login
      set({ status: 'unauthenticated', error: null });
    }
  },

  // ── t-1/t-2/admin: Step 1 — Password ────────────────────────────────────────
  loginPassword: async (email, password) => {
    set({ status: 'loading', error: null });
    try {
      const res = await api.auth.login(email, password);
      if (res.mustChangePassword) {
        // First login — force password change before TOTP
        set({ status: 'change_password', mfaToken: res.mfaToken, error: null });
      } else if (res.mfaPending && res.totpSetupRequired) {
        set({ status: 'setup_totp', mfaToken: res.mfaToken, error: null });
        const setup = await api.auth.setupTotp(res.mfaToken);
        set({ totpSetupData: setup });
      } else if (res.mfaPending) {
        set({ status: 'step1_done', mfaToken: res.mfaToken, error: null });
      }
    } catch (err) {
      set({ status: 'unauthenticated', error: err.message });
    }
  },

  // ── Force password change (first login) ───────────────────────────────────
  changePassword: async (newPassword) => {
    set({ status: 'loading', error: null });
    try {
      const { mfaToken } = get();
      const res = await api.auth.changePassword(mfaToken, newPassword);
      // After password change, proceed to TOTP setup or verification
      if (res.totpSetupRequired) {
        set({ status: 'setup_totp', mfaToken: res.mfaToken, error: null });
        const setup = await api.auth.setupTotp(res.mfaToken);
        set({ totpSetupData: setup });
      } else {
        set({ status: 'step1_done', mfaToken: res.mfaToken, error: null });
      }
    } catch (err) {
      set({ status: 'change_password', error: err.message });
    }
  },

  // ── t-1/t-2: Confirm first-time TOTP setup ────────────────────────────────
  confirmTotpSetup: async (code) => {
    set({ status: 'loading', error: null });
    try {
      const { mfaToken } = get();
      const res = await api.auth.confirmTotp(mfaToken, code);
      sessionStorage.setItem(TOKEN_KEY, res.token);
      set({ status: 'authenticated', user: res.user, mfaToken: null, totpSetupData: null, error: null });
    } catch (err) {
      set({ status: 'setup_totp', error: err.message });
    }
  },

  // ── t-1/t-2: Step 2 — TOTP code ──────────────────────────────────────────
  verifyTotp: async (code) => {
    set({ status: 'loading', error: null });
    try {
      const { mfaToken } = get();
      const res = await api.auth.verifyTotp(mfaToken, code);
      sessionStorage.setItem(TOKEN_KEY, res.token);
      set({ status: 'authenticated', user: res.user, mfaToken: null, error: null });
    } catch (err) {
      set({ status: 'step1_done', error: err.message });
    }
  },

  // ── t-3: Request email OTP ────────────────────────────────────────────────
  requestOtp: async (email) => {
    set({ status: 'loading', error: null });
    try {
      await api.auth.requestOtp(email);
      // Store email for step 2
      set({ status: 'step1_done', mfaToken: email, error: null });
    } catch (err) {
      set({ status: 'unauthenticated', error: err.message });
    }
  },

  // ── t-3: Verify email OTP ─────────────────────────────────────────────────
  verifyOtp: async (otp) => {
    set({ status: 'loading', error: null });
    try {
      const email = get().mfaToken; // email stored in mfaToken field for t-3
      const res = await api.auth.verifyOtp(email, otp);
      sessionStorage.setItem(TOKEN_KEY, res.token);
      set({ status: 'authenticated', user: res.user, mfaToken: null, error: null });
    } catch (err) {
      set({ status: 'step1_done', error: err.message });
    }
  },

  // ── Logout ────────────────────────────────────────────────────────────────
  logout: async () => {
    try { await api.auth.logout(); } catch { /* ignore */ }
    sessionStorage.removeItem(TOKEN_KEY);
    set({ status: 'unauthenticated', user: null, mfaToken: null, totpSetupData: null, error: null });
  },

  clearError: () => set({ error: null }),
}));

export default useAuth;
