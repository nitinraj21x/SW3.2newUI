import { useEffect } from 'react';
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, title, children, size = 'md', className = '' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm:   'max-w-md',
    md:   'max-w-2xl',
    lg:   'max-w-4xl',
    xl:   'max-w-6xl',
    full: 'max-w-[95vw]',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <div
        className={`relative w-full ${sizes[size]} border rounded-xl shadow-2xl flex flex-col max-h-[90vh] transition-colors duration-200 ${className}`}
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b shrink-0"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--text-faint)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'var(--text-faint)'; }}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>
        {/* Body */}
        <div className="overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', variant = 'danger' }) {
  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="p-6 space-y-4">
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{message}</p>
        <div className="flex gap-3 justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
            style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border-default)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'; }}
          >
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
              variant === 'danger' ? 'bg-red-600 hover:bg-red-500' : 'bg-cyan-600 hover:bg-cyan-500'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}

