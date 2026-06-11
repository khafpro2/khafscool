'use client';

import React, { useEffect, useState, createContext, useContext, useCallback } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────
interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'badge';
  icon?: string;
  duration?: number;
}

interface ToastContextValue {
  show: (opts: Omit<ToastItem, 'id'>) => void;
  showBadge: (badgeName: string, icon?: string) => void;
}

// ── Context ────────────────────────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

// ── Provider ───────────────────────────────────────────────────────────────
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const show = useCallback((opts: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    const duration = opts.duration ?? 4000;
    setToasts((t) => [...t.slice(-3), { ...opts, id }]); // max 4 toasts
    setTimeout(() => remove(id), duration);
  }, [remove]);

  const showBadge = useCallback((badgeName: string, icon = '🏅') => {
    show({
      type: 'badge',
      icon,
      message: `Badge obtenu : ${badgeName} !`,
      duration: 5000,
    });
  }, [show]);

  return (
    <ToastContext.Provider value={{ show, showBadge } as ToastContextValue}>
      {children}
      {/* Toast container */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="false"
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          maxWidth: '360px',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={remove} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ── Single Toast ────────────────────────────────────────────────────────────
function ToastItem({ toast, onRemove }: { toast: ToastItem; onRemove: (id: string) => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const bg: Record<ToastItem['type'], string> = {
    success: '#d1fae5',
    error: '#fee2e2',
    info: '#dbeafe',
    badge: 'linear-gradient(135deg, #dbeafe, #ede9fe)',
  };

  const border: Record<ToastItem['type'], string> = {
    success: '#6ee7b7',
    error: '#fca5a5',
    info: '#93c5fd',
    badge: '#a5b4fc',
  };

  return (
    <div
      style={{
        background: bg[toast.type],
        border: `1px solid ${border[toast.type]}`,
        borderRadius: 14,
        padding: '0.75rem 1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.625rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
        pointerEvents: 'all',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.25s, transform 0.25s',
        cursor: 'pointer',
      }}
      onClick={() => { setVisible(false); setTimeout(() => onRemove(toast.id), 250); }}
      role="alert"
    >
      {toast.icon && (
        <span style={{ fontSize: '1.4rem', lineHeight: 1, flexShrink: 0 }} aria-hidden>
          {toast.icon}
        </span>
      )}
      <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: '#1d1d1f', lineHeight: 1.4 }}>
        {toast.message}
      </p>
    </div>
  );
}
