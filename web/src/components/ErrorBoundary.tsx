'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary:', error, info.componentStack);
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          style={{
            margin: '2rem auto',
            maxWidth: '32rem',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid var(--border, #e5e7eb)',
            background: 'var(--surface, #fff)',
            textAlign: 'center',
          }}
        >
          <h1 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Une erreur est survenue</h1>
          <p style={{ color: 'var(--muted, #6b7280)', marginBottom: '1.25rem' }}>
            L&apos;application a rencontré un problème inattendu. Recharge la page pour réessayer.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            style={{
              padding: '0.625rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              background: 'var(--accent, #2563eb)',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Recharger la page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export function AppErrorBoundary({ children }: ErrorBoundaryProps) {
  // @ts-expect-error React 19 — refs manquant sur ComponentClass (@types/react)
  return <ErrorBoundary>{children}</ErrorBoundary>;
}
