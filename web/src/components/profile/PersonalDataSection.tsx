'use client';

import { useState, type FormEvent } from 'react';
import { deleteAccount, exportUserData } from '@/lib/api';
import { buildAuthUrl, clearAuthTokens, getAccessToken } from '@/lib/auth';
import { showToast } from '@/lib/toast-store';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export function PersonalDataSection() {
  const [isExporting, setIsExporting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleExport() {
    const token = getAccessToken();
    if (!token) return;

    setIsExporting(true);
    try {
      const data = await exportUserData(token);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `mdm-academy-export-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      showToast({
        kind: 'success',
        title: 'Export téléchargé',
        body: 'Tes données personnelles ont été exportées en JSON.',
      });
    } catch {
      window.alert('Impossible d’exporter tes données. Réessaie dans un instant ou vérifie ta connexion à l’API.');
    } finally {
      setIsExporting(false);
    }
  }

  async function handleDelete(event: FormEvent) {
    event.preventDefault();
    setDeleteError(null);

    if (confirmText.trim() !== 'SUPPRIMER') {
      setDeleteError('Saisis exactement SUPPRIMER pour confirmer.');
      return;
    }

    const token = getAccessToken();
    if (!token) {
      setDeleteError('Connecte-toi pour supprimer ton compte.');
      return;
    }

    setIsDeleting(true);
    try {
      await deleteAccount(token, 'SUPPRIMER');
      clearAuthTokens();
      setShowDeleteModal(false);
      showToast({
        kind: 'success',
        title: 'Compte supprimé',
        body: 'Tes données ont été effacées. À bientôt !',
      });
      window.location.href = buildAuthUrl('/');
    } catch {
      setDeleteError('Impossible de supprimer le compte. Réessaie ou contacte le support.');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <Card style={{ marginTop: '1.25rem' }}>
        <span className="section-eyebrow">Données personnelles</span>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '0.35rem' }}>
          Export et suppression (RGPD)
        </h2>
        <p className="muted" style={{ marginTop: '0.5rem', fontSize: '0.9rem', lineHeight: 1.5 }}>
          Télécharge une copie de ton profil, ta progression, tes badges et tes points. La suppression
          efface définitivement ton compte et toutes les données associées.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginTop: '1rem' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            disabled={isExporting}
            onClick={() => void handleExport()}
          >
            {isExporting ? 'Export…' : 'Exporter mes données (JSON)'}
          </button>
          <button
            type="button"
            className="btn btn-sm"
            style={{ background: '#dc2626', borderColor: '#dc2626', color: '#fff' }}
            onClick={() => {
              setConfirmText('');
              setDeleteError(null);
              setShowDeleteModal(true);
            }}
          >
            Supprimer mon compte
          </button>
        </div>
      </Card>

      {showDeleteModal ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-title"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(15, 23, 42, 0.55)',
            display: 'grid',
            placeItems: 'center',
            padding: '1rem',
          }}
          onClick={() => !isDeleting && setShowDeleteModal(false)}
        >
          <div
            style={{ maxWidth: 440, width: '100%' }}
            onClick={(event) => event.stopPropagation()}
            role="document"
          >
            <Card style={{ margin: 0 }}>
            <h2 id="delete-account-title" style={{ fontSize: '1.2rem', fontWeight: 800 }}>
              Supprimer définitivement mon compte ?
            </h2>
            <p className="muted" style={{ marginTop: '0.75rem', lineHeight: 1.5, fontSize: '0.9rem' }}>
              Cette action est irréversible. Toute ta progression, tes badges, tes quêtes et tes sessions
              seront effacés.
            </p>
            <form onSubmit={handleDelete} style={{ marginTop: '1rem' }}>
              <label
                htmlFor="delete-confirm"
                className="muted"
                style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}
              >
                Saisis SUPPRIMER pour confirmer
              </label>
              <input
                id="delete-confirm"
                type="text"
                value={confirmText}
                onChange={(event) => {
                  setConfirmText(event.target.value);
                  if (deleteError) setDeleteError(null);
                }}
                autoComplete="off"
                aria-invalid={Boolean(deleteError)}
                style={{
                  width: '100%',
                  marginTop: '0.5rem',
                  padding: '0.55rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${deleteError ? '#dc2626' : 'var(--border)'}`,
                  background: 'var(--surface)',
                  color: 'var(--fg)',
                  fontWeight: 700,
                }}
              />
              {deleteError ? (
                <p role="alert" style={{ marginTop: '0.5rem', color: '#dc2626', fontSize: '0.88rem', fontWeight: 600 }}>
                  {deleteError}
                </p>
              ) : null}
              <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                <button type="submit" className="btn btn-sm" disabled={isDeleting} style={{ background: '#dc2626', borderColor: '#dc2626', color: '#fff' }}>
                  {isDeleting ? 'Suppression…' : 'Confirmer la suppression'}
                </button>
                <Button type="button" variant="ghost" size="sm" disabled={isDeleting} onClick={() => setShowDeleteModal(false)}>
                  Annuler
                </Button>
              </div>
            </form>
            </Card>
          </div>
        </div>
      ) : null}
    </>
  );
}
