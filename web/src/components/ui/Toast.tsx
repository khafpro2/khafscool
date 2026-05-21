'use client';

import { useSyncExternalStore } from 'react';
import { dismissToast, getToasts, subscribeToasts, type ToastKind, type ToastRecord } from '@/lib/toast-store';

const KIND_META: Record<
  ToastKind,
  { icon: string; label: string; className: string }
> = {
  points: { icon: '\u2B50', label: 'Points gagnés', className: 'toast--points' },
  badge: { icon: '\u{1F3C6}', label: 'Badge débloqué', className: 'toast--badge' },
  quest: { icon: '\u{1F3AF}', label: 'Quête accomplie', className: 'toast--quest' },
};

export function Toaster() {
  const toasts = useSyncExternalStore(subscribeToasts, getToasts, getToasts);

  if (!toasts.length) return null;

  return (
    <div className="toast-viewport" aria-live="polite" aria-relevant="additions" aria-atomic="false">
      <ol className="toast-list">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </ol>
    </div>
  );
}

function ToastItem({ toast }: { toast: ToastRecord }) {
  const meta = KIND_META[toast.kind];

  return (
    <li className={`toast ${meta.className}`} role="status">
      <span className="toast-icon" aria-hidden>
        {meta.icon}
      </span>
      <div className="toast-body">
        <p className="toast-eyebrow">{meta.label}</p>
        <p className="toast-title">{toast.title}</p>
        {toast.body ? <p className="toast-message">{toast.body}</p> : null}
      </div>
      <button
        type="button"
        className="toast-dismiss"
        aria-label="Fermer la notification"
        onClick={() => dismissToast(toast.id)}
      >
        ×
      </button>
    </li>
  );
}
