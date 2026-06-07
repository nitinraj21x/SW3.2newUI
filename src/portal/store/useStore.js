/**
 * useStore.js — kS2
 *
 * All data (candidates, jobs, events, audit) now comes from the real API.
 * localStorage is no longer used for data persistence.
 * Auth is handled entirely by useAuth — this store only manages UI state,
 * RBAC checks, and in-memory data caches loaded from the API.
 */
import { create } from 'zustand';
import { api }    from '../utils/api';
import { DEFAULT_SCORING_CONFIG } from '../utils/scoring';

// ── RBAC permission matrix ────────────────────────────────────────────────────
export const PERMISSIONS = {
  canViewTab: (role, tab) => {
    if (role === 't-1') return true;
    if (role === 't-2') return ['candidates', 'jobs'].includes(tab);
    if (role === 't-3') return tab === 'candidates';
    return false;
  },
  canAddCandidate:    (role) => role === 't-1' || role === 't-2',
  canEditCandidate:   (role, candidate, userId) => {
    if (role === 't-1') return true;
    if (role === 't-2') return String(candidate.addedBy) === String(userId);
    return false;
  },
  canDeleteCandidate: (role) => role === 't-1',
  canShareCandidate:  (role) => role === 't-1' || role === 't-2',
  canBulkEmail:       (role) => role === 't-1' || role === 't-2',
  canExportCSV:       (role) => role === 't-1' || role === 't-2',
  canAddJob:          (role) => role === 't-1',
  canEditJob:         (role) => role === 't-1',
  canDeleteJob:       (role) => role === 't-1',
  canViewJobs:        (role) => role === 't-1' || role === 't-2',
  canViewScoring:     (role) => role === 't-1',
  canViewAudit:       (role) => role === 't-1',
  canViewEvents:      (role) => role === 't-1',
  canManageEvents:    (role) => role === 't-1',
};

const useStore = create((set, get) => ({

  // ── Current user (synced from useAuth by PortalApp) ───────────────────────
  currentUser: null,
  setCurrentUser: (user) => {
    const { activeTab } = get();
    if (!user) return set({ currentUser: null });
    const canSee = PERMISSIONS.canViewTab(user.role, activeTab);
    const fallback = user.role === 't-3' ? 'candidates'
      : user.role === 't-2' ? 'candidates' : 'overview';
    set({ currentUser: user, activeTab: canSee ? activeTab : fallback });
  },

  // ── Navigation ────────────────────────────────────────────────────────────
  activeTab: 'overview',
  setActiveTab: (tab) => {
    const { currentUser } = get();
    if (currentUser && PERMISSIONS.canViewTab(currentUser.role, tab)) {
      set({ activeTab: tab });
    }
  },

  // ── Candidates ────────────────────────────────────────────────────────────
  candidates:         [],
  candidatesLoading:  false,
  candidatesError:    null,

  fetchCandidates: async () => {
    set({ candidatesLoading: true, candidatesError: null });
    try {
      const data = await api.candidates.list();
      set({ candidates: data, candidatesLoading: false });
    } catch (err) {
      set({ candidatesError: err.message, candidatesLoading: false });
    }
  },

  addCandidate: async (candidateData) => {
    const { currentUser } = get();
    if (!PERMISSIONS.canAddCandidate(currentUser?.role)) return null;
    try {
      const created = await api.candidates.create(candidateData);
      set((s) => ({ candidates: [created, ...s.candidates] }));
      get().addAuditLogLocal({
        action: 'CANDIDATE_ADDED', targetId: created._id,
        targetName: `${created.firstName} ${created.lastName}`,
        detail: candidateData._resumeUploaded
          ? `Created via resume upload (${candidateData._resumeFileName}).`
          : 'Profile created manually.',
      });
      return created;
    } catch (err) {
      console.error('[addCandidate]', err.message);
      return null;
    }
  },

  updateCandidate: async (id, updates) => {
    const { currentUser, candidates } = get();
    const candidate = candidates.find((c) => c._id === id || c.id === id);
    if (!candidate) return false;
    if (!PERMISSIONS.canEditCandidate(currentUser?.role, candidate, currentUser?.id)) return false;
    try {
      const updated = await api.candidates.update(id, updates);
      set((s) => ({ candidates: s.candidates.map((c) => (c._id === id || c.id === id ? updated : c)) }));
      get().addAuditLogLocal({
        action: 'CANDIDATE_EDITED', targetId: id,
        targetName: `${candidate.firstName} ${candidate.lastName}`,
        detail: `Updated: ${Object.keys(updates).filter(k => !k.startsWith('_')).join(', ')}.`,
      });
      return true;
    } catch (err) {
      console.error('[updateCandidate]', err.message);
      return false;
    }
  },

  deleteCandidate: async (id) => {
    const { currentUser, candidates } = get();
    if (!PERMISSIONS.canDeleteCandidate(currentUser?.role)) return false;
    const candidate = candidates.find((c) => c._id === id || c.id === id);
    if (!candidate) return false;
    try {
      await api.candidates.delete(id);
      set((s) => ({ candidates: s.candidates.filter((c) => c._id !== id && c.id !== id) }));
      get().addAuditLogLocal({
        action: 'CANDIDATE_DELETED', targetId: id,
        targetName: `${candidate.firstName} ${candidate.lastName}`,
        detail: 'Candidate permanently deleted.',
      });
      return true;
    } catch (err) {
      console.error('[deleteCandidate]', err.message);
      return false;
    }
  },

  shareCandidate: async (candidateId, clientUserId, action = 'toggle') => {
    const { currentUser, candidates } = get();
    if (!PERMISSIONS.canShareCandidate(currentUser?.role)) return;
    const candidate = candidates.find((c) => c._id === candidateId || c.id === candidateId);
    if (!candidate) return;
    try {
      const updated = await api.candidates.share(candidateId, clientUserId, action);
      set((s) => ({ candidates: s.candidates.map((c) => (c._id === candidateId || c.id === candidateId ? updated : c)) }));
      const already = (candidate.sharedWith || []).map(String).includes(String(clientUserId));
      get().addAuditLogLocal({
        action: 'PROFILE_SHARED', targetId: candidateId,
        targetName: `${candidate.firstName} ${candidate.lastName}`,
        detail: already ? `Unshared from client ${clientUserId}.` : `Shared with client ${clientUserId}.`,
      });
    } catch (err) {
      console.error('[shareCandidate]', err.message);
    }
  },

  getVisibleCandidates: () => {
    // Visibility is enforced server-side — just return what we have
    return get().candidates;
  },

  canEditCandidate: (candidate) => {
    const { currentUser } = get();
    return currentUser
      ? PERMISSIONS.canEditCandidate(currentUser.role, candidate, currentUser.id)
      : false;
  },

  // ── Audit Logs ────────────────────────────────────────────────────────────
  // Optimistic local log (shown immediately; backed by server via fetchAuditLogs)
  auditLogs:        [],
  auditLoading:     false,

  fetchAuditLogs: async (page = 1) => {
    set({ auditLoading: true });
    try {
      const data = await api.audit.list(page);
      set({ auditLogs: data.logs, auditLoading: false });
    } catch {
      set({ auditLoading: false });
    }
  },

  // Adds to local list immediately (does NOT call API — server creates it as part of the operation)
  addAuditLogLocal: ({ action, targetId, targetName, detail }) => {
    const { currentUser } = get();
    const log = {
      _id:       `local_${Date.now()}`,
      action,
      userId:    currentUser?.id,
      userName:  currentUser?.name || '',
      userRole:  currentUser?.role || '',
      targetId,
      targetName,
      detail,
      timestamp: new Date().toISOString(),
    };
    set((s) => ({ auditLogs: [log, ...s.auditLogs] }));
  },

  // ── Jobs ──────────────────────────────────────────────────────────────────
  jobs:        [],
  jobsLoading: false,

  fetchJobs: async () => {
    set({ jobsLoading: true });
    try {
      const data = await api.jobs.list();
      set({ jobs: data, jobsLoading: false });
    } catch {
      set({ jobsLoading: false });
    }
  },

  addJob: async (jobData) => {
    const { currentUser } = get();
    if (!PERMISSIONS.canAddJob(currentUser?.role)) return null;
    try {
      const created = await api.jobs.create(jobData);
      set((s) => ({ jobs: [created, ...s.jobs] }));
      get().addAuditLogLocal({ action: 'JOB_ADDED', targetId: created._id, targetName: created.title, detail: `Job "${created.title}" created for ${created.client}.` });
      return created;
    } catch (err) { console.error('[addJob]', err.message); return null; }
  },

  updateJob: async (id, updates) => {
    const { currentUser, jobs } = get();
    if (!PERMISSIONS.canEditJob(currentUser?.role)) return false;
    const job = jobs.find((j) => j._id === id || j.id === id);
    if (!job) return false;
    try {
      const updated = await api.jobs.update(id, updates);
      set((s) => ({ jobs: s.jobs.map((j) => (j._id === id || j.id === id ? updated : j)) }));
      get().addAuditLogLocal({ action: 'JOB_EDITED', targetId: id, targetName: job.title, detail: `Job "${job.title}" updated.` });
      return true;
    } catch (err) { console.error('[updateJob]', err.message); return false; }
  },

  deleteJob: async (id) => {
    const { currentUser, jobs } = get();
    if (!PERMISSIONS.canDeleteJob(currentUser?.role)) return false;
    const job = jobs.find((j) => j._id === id || j.id === id);
    if (!job) return false;
    try {
      await api.jobs.delete(id);
      set((s) => ({ jobs: s.jobs.filter((j) => j._id !== id && j.id !== id) }));
      get().addAuditLogLocal({ action: 'JOB_DELETED', targetId: id, targetName: job.title, detail: `Job "${job.title}" deleted.` });
      return true;
    } catch (err) { console.error('[deleteJob]', err.message); return false; }
  },

  // ── Events ────────────────────────────────────────────────────────────────
  events:        [],
  eventsLoading: false,

  fetchEvents: async () => {
    set({ eventsLoading: true });
    try {
      const data = await api.events.list();
      set({ events: data, eventsLoading: false });
    } catch {
      set({ eventsLoading: false });
    }
  },

  addEvent: async (eventData) => {
    const { currentUser } = get();
    if (!PERMISSIONS.canManageEvents(currentUser?.role)) return null;
    try {
      const created = await api.events.create(eventData);
      set((s) => ({ events: [created, ...s.events] }));
      get().addAuditLogLocal({ action: 'EVENT_ADDED', targetId: created._id, targetName: created.title, detail: `Event "${created.title}" created.` });
      return created;
    } catch (err) { console.error('[addEvent]', err.message); return null; }
  },

  updateEvent: async (id, updates) => {
    const { currentUser, events } = get();
    if (!PERMISSIONS.canManageEvents(currentUser?.role)) return false;
    const event = events.find((e) => e._id === id || e.id === id);
    if (!event) return false;
    try {
      const updated = await api.events.update(id, updates);
      set((s) => ({ events: s.events.map((e) => (e._id === id || e.id === id ? updated : e)) }));
      get().addAuditLogLocal({ action: 'EVENT_EDITED', targetId: id, targetName: event.title, detail: `Event "${event.title}" updated.` });
      return true;
    } catch (err) { console.error('[updateEvent]', err.message); return false; }
  },

  deleteEvent: async (id) => {
    const { currentUser, events } = get();
    if (!PERMISSIONS.canManageEvents(currentUser?.role)) return false;
    const event = events.find((e) => e._id === id || e.id === id);
    if (!event) return false;
    try {
      await api.events.delete(id);
      set((s) => ({ events: s.events.filter((e) => e._id !== id && e.id !== id) }));
      get().addAuditLogLocal({ action: 'EVENT_DELETED', targetId: id, targetName: event.title, detail: `Event "${event.title}" deleted.` });
      return true;
    } catch (err) { console.error('[deleteEvent]', err.message); return false; }
  },

  // ── UI State ──────────────────────────────────────────────────────────────
  selectedCandidateId:    null,
  setSelectedCandidateId: (id) => set({ selectedCandidateId: id }),
  isAddCandidateOpen:     false,
  setIsAddCandidateOpen:  (v) => set({ isAddCandidateOpen: v }),
  editingCandidateId:     null,
  setEditingCandidateId:  (id) => set({ editingCandidateId: id }),
  isBulkEmailOpen:        false,
  setIsBulkEmailOpen:     (v) => set({ isBulkEmailOpen: v }),
  selectedCandidateIds:   [],
  toggleCandidateSelection: (id) => set((s) => ({
    selectedCandidateIds: s.selectedCandidateIds.includes(id)
      ? s.selectedCandidateIds.filter((i) => i !== id)
      : [...s.selectedCandidateIds, id],
  })),
  selectAllCandidates:     (ids) => set({ selectedCandidateIds: ids }),
  clearCandidateSelection: ()    => set({ selectedCandidateIds: [] }),

  // ── Scoring ───────────────────────────────────────────────────────────────
  scoringConfig:      { ...DEFAULT_SCORING_CONFIG },
  setScoringConfig:   (config) => set({ scoringConfig: config }),
  resetScoringConfig: ()       => set({ scoringConfig: { ...DEFAULT_SCORING_CONFIG } }),

  // ── Client management (t-1 only) ─────────────────────────────────────────
  clients:        [],
  clientsLoading: false,

  fetchClients: async () => {
    set({ clientsLoading: true });
    try {
      const data = await api.auth.listClients();
      set({ clients: data, clientsLoading: false });
    } catch { set({ clientsLoading: false }); }
  },

  createClient: async (name, email) => {
    try {
      const client = await api.auth.createClient(name, email);
      set((s) => ({ clients: [client, ...s.clients] }));
      return client;
    } catch (err) { throw err; }
  },

  toggleClient: async (id) => {
    try {
      const updated = await api.auth.toggleClient(id);
      set((s) => ({ clients: s.clients.map((c) => (c.id === id || c._id === id ? { ...c, active: updated.active } : c)) }));
      return updated;
    } catch (err) { throw err; }
  },

  deleteClient: async (id) => {
    try {
      await api.auth.deleteClient(id);
      set((s) => ({ clients: s.clients.filter((c) => c.id !== id && c._id !== id) }));
    } catch (err) { throw err; }
  },
}));

export default useStore;
