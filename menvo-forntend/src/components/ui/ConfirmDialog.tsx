import { X } from 'lucide-react'
import { Button } from './Button'

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  isDestructive?: boolean;
}

export function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', isDestructive = false }: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="rdialog-overlay" onClick={onCancel} style={{ zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-overlay)', position: 'fixed', inset: 0 }}>
      <div className="rdialog" onClick={(e) => e.stopPropagation()} style={{ background: 'var(--color-bg-card)', padding: '24px', borderRadius: 'var(--radius-xl)', maxWidth: 400, width: '90%', boxShadow: 'var(--shadow-dialog)', position: 'relative' }}>
        <button className="rdialog__close" onClick={onCancel} type="button" aria-label="Close" style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
          <X size={20} />
        </button>
        <h2 style={{ margin: '0 0 12px 0', fontSize: '1.25rem', color: 'var(--color-text-primary)' }}>{title}</h2>
        <p style={{ margin: '0 0 24px 0', fontSize: '0.95rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{message}</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <Button onClick={onCancel} variant="ghost" style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-primary)' }}>Cancel</Button>
          <Button onClick={onConfirm} variant={isDestructive ? 'danger' : 'primary'} style={{ background: isDestructive ? 'var(--color-error)' : 'var(--color-accent-green)', color: 'var(--color-on-dark)' }}>{confirmText}</Button>
        </div>
      </div>
    </div>
  )
}
