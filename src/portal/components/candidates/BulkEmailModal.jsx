import { useState } from 'react';
import { Send, ChevronDown } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Textarea, Input } from '../ui/Input';
import { EMAIL_TEMPLATES } from '../../data/mockData';
import useStore from '../../store/useStore';

export function BulkEmailModal({ isOpen, onClose }) {
  const { candidates, selectedCandidateIds, addAuditLog, clearCandidateSelection } = useStore();
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody]       = useState('');
  const [sent, setSent]       = useState(false);

  const selectedCandidates = candidates.filter((c) => selectedCandidateIds.includes(c.id));

  const applyTemplate = (templateId) => {
    const tpl = EMAIL_TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;
    setSelectedTemplate(templateId);
    setSubject(tpl.subject);
    setBody(tpl.body);
  };

  const handleSend = () => {
    if (!subject.trim() || !body.trim()) return;
    addAuditLog({
      action:     'BULK_EMAIL_SENT',
      targetId:   null,
      targetName: `${selectedCandidates.length} candidates`,
      detail:     `Bulk email sent: "${subject}" to ${selectedCandidates.map((c) => c.email).join(', ')}.`,
    });
    setSent(true);
    setTimeout(() => { setSent(false); clearCandidateSelection(); onClose(); }, 2000);
  };

  const selectStyle = {
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border-default)',
    color: 'var(--text-primary)',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bulk Email" size="md">
      <div className="p-6 space-y-5">

        {/* Recipients */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-faint)' }}>
            Recipients ({selectedCandidates.length})
          </p>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {selectedCandidates.map((c) => (
              <span key={c.id} className="px-2 py-0.5 rounded-md text-xs border"
                style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}>
                {c.firstName} {c.lastName}
                <span className="ml-1" style={{ color: 'var(--text-faint)' }}>({c.email})</span>
              </span>
            ))}
          </div>
        </div>

        {/* Template selector */}
        <div className="space-y-1">
          <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Email Template</label>
          <div className="relative">
            <select
              value={selectedTemplate}
              onChange={(e) => applyTemplate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none pr-8"
              style={selectStyle}
            >
              <option value="">— Select a template or write custom —</option>
              {EMAIL_TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-faint)' }} />
          </div>
        </div>

        <Input
          label="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Email subject..."
          required
        />

        <Textarea
          label="Message Body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={8}
          placeholder={'Write your message here...\n\nUse {{firstName}}, {{primarySkill}} as placeholders.'}
          required
        />

        <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--bg-elevated)' }}>
          <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
            Available placeholders:{' '}
            <code className="text-cyan-400">{'{{firstName}}'}</code>,{' '}
            <code className="text-cyan-400">{'{{lastName}}'}</code>,{' '}
            <code className="text-cyan-400">{'{{primarySkill}}'}</code>,{' '}
            <code className="text-cyan-400">{'{{role}}'}</code>
          </p>
        </div>

        <div className="flex gap-3 pt-1">
          <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
          <Button
            variant={sent ? 'success' : 'primary'}
            icon={sent ? undefined : Send}
            onClick={handleSend}
            disabled={!subject.trim() || !body.trim() || sent}
            className="flex-1"
          >
            {sent
              ? '✓ Sent Successfully'
              : `Send to ${selectedCandidates.length} Candidate${selectedCandidates.length !== 1 ? 's' : ''}`
            }
          </Button>
        </div>
      </div>
    </Modal>
  );
}


