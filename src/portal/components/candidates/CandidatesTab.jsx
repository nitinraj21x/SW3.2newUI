import { useState, useMemo } from 'react';
import { UserPlus, Mail, Download, Eye } from 'lucide-react';
import useStore, { PERMISSIONS } from '../../store/useStore';
import { FilterPanel, DEFAULT_FILTERS } from './FilterPanel';
import { CandidateTable } from './CandidateTable';
import { CandidateDetail } from './CandidateDetail';
import { CandidateForm } from './CandidateForm';
import { BulkEmailModal } from './BulkEmailModal';
import { Button } from '../ui/Button';

export function CandidatesTab() {
  const {
    currentUser,
    getVisibleCandidates,
    selectedCandidateIds,
    setIsAddCandidateOpen,
    isAddCandidateOpen,
    editingCandidateId,
    setEditingCandidateId,
    isBulkEmailOpen,
    setIsBulkEmailOpen,
    addAuditLog,
  } = useStore();

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [viewingId, setViewingId] = useState(null);

  const role      = currentUser.role;
  const canAdd    = PERMISSIONS.canAddCandidate(role);
  const canEmail  = PERMISSIONS.canBulkEmail(role);
  const canExport = PERMISSIONS.canExportCSV(role);

  const allCandidates = getVisibleCandidates();

  const filtered = useMemo(() => {
    return allCandidates.filter((c) => {
      const q = filters.search.toLowerCase();
      if (q) {
        const s = `${c.firstName} ${c.lastName} ${c.email || ''} ${c.currentRole || ''} ${c.currentCompany || ''} ${c.location || ''}`.toLowerCase();
        if (!s.includes(q)) return false;
      }
      if (filters.status !== 'All' && c.status !== filters.status) return false;
      if (filters.noticePeriod !== 'Any' && c.noticePeriod !== filters.noticePeriod) return false;
      if (filters.location && !(c.location || '').toLowerCase().includes(filters.location.toLowerCase())) return false;
      if (filters.experience.label !== 'Any') {
        if (c.totalExperience < filters.experience.min || c.totalExperience > filters.experience.max) return false;
      }
      if (filters.skills.length > 0) {
        const cl = (c.skills || []).map((s) => s.toLowerCase());
        if (!filters.skills.every((fs) => cl.includes(fs.toLowerCase()))) return false;
      }
      return true;
    });
  }, [allCandidates, filters]);

  const handleExport = () => {
    if (!canExport) return;
    const headers = ['Name', 'Email', 'Phone', 'Location', 'Role', 'Company', 'Experience', 'Skills', 'Status', 'Notice Period'];
    const rows = filtered.map((c) => [
      `${c.firstName} ${c.lastName}`,
      c.email || '', c.phone || '', c.location || '',
      c.currentRole || '', c.currentCompany || '',
      `${c.totalExperience || 0} yrs`,
      (c.skills || []).join('; '),
      c.status || '', c.noticePeriod || '',
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'candidates.csv'; a.click();
    URL.revokeObjectURL(url);
    addAuditLog({ action: 'DATA_EXPORTED', targetId: null, targetName: 'Filtered Candidates', detail: `Exported ${filtered.length} candidates to CSV.` });
  };

  return (
    <div className="p-6 space-y-4 max-w-full">

      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
            {filtered.length} candidate{filtered.length !== 1 ? 's' : ''}
            {filtered.length !== allCandidates.length && (
              <span className="font-normal" style={{ color: 'var(--text-faint)' }}>
                {' '}(filtered from {allCandidates.length})
              </span>
            )}
          </h2>
          {/* t-3 read-only notice */}
          {role === 't-3' && (
            <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: 'var(--text-faint)' }}>
              <Eye size={11} /> Viewing shared profiles only
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {canEmail && selectedCandidateIds.length > 0 && (
            <Button variant="warning" size="sm" icon={Mail} onClick={() => setIsBulkEmailOpen(true)}>
              Email {selectedCandidateIds.length} Selected
            </Button>
          )}
          {canExport && (
            <Button variant="secondary" size="sm" icon={Download} onClick={handleExport}>
              Export CSV
            </Button>
          )}
          {canAdd && (
            <Button variant="primary" size="sm" icon={UserPlus} onClick={() => setIsAddCandidateOpen(true)}>
              Add Candidate
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <FilterPanel filters={filters} onChange={setFilters} />

      {/* Table */}
      <CandidateTable
        candidates={filtered}
        onViewCandidate={(id) => setViewingId(id)}
        onEditCandidate={(id) => setEditingCandidateId(id)}
      />

      {/* Detail */}
      {viewingId && (
        <CandidateDetail
          candidateId={viewingId}
          onClose={() => setViewingId(null)}
          onEdit={() => { setEditingCandidateId(viewingId); setViewingId(null); }}
        />
      )}

      {/* Add form — only for t-1 / t-2 */}
      {canAdd && (
        <CandidateForm
          isOpen={isAddCandidateOpen}
          onClose={() => setIsAddCandidateOpen(false)}
          editingId={null}
        />
      )}

      {/* Edit form — only for t-1 / t-2 */}
      {editingCandidateId && (
        <CandidateForm
          isOpen={!!editingCandidateId}
          onClose={() => setEditingCandidateId(null)}
          editingId={editingCandidateId}
        />
      )}

      {/* Bulk email */}
      {canEmail && (
        <BulkEmailModal
          isOpen={isBulkEmailOpen}
          onClose={() => setIsBulkEmailOpen(false)}
        />
      )}
    </div>
  );
}
