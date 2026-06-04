export type CertificatePrintOutcome = 'opened' | 'cancelled' | 'unsupported';

export type CertificatePrintResult =
  | { ok: true; outcome: CertificatePrintOutcome }
  | { ok: false; message: string };

const PRINT_DIALOG_TIMEOUT_MS = 12_000;

export function getCertificatePrintErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return 'Impossible d’ouvrir la fenêtre d’impression. Utilise le menu Fichier → Imprimer de ton navigateur.';
}

export function requestCertificatePdfPrint(): Promise<CertificatePrintResult> {
  if (typeof window === 'undefined') {
    return Promise.resolve({
      ok: false,
      message: 'L’enregistrement PDF n’est disponible que dans le navigateur.',
    });
  }

  if (typeof window.print !== 'function') {
    return Promise.resolve({
      ok: false,
      message: 'L’enregistrement PDF n’est pas pris en charge sur cet appareil.',
    });
  }

  return new Promise((resolve) => {
    let settled = false;

    const finish = (result: CertificatePrintResult) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      window.removeEventListener('afterprint', onAfterPrint);
      resolve(result);
    };

    const onAfterPrint = () => {
      finish({ ok: true, outcome: 'opened' });
    };

    const timeoutId = window.setTimeout(() => {
      finish({
        ok: true,
        outcome: 'cancelled',
      });
    }, PRINT_DIALOG_TIMEOUT_MS);

    window.addEventListener('afterprint', onAfterPrint, { once: true });

    try {
      window.print();
    } catch (error) {
      finish({
        ok: false,
        message: getCertificatePrintErrorMessage(error),
      });
    }
  });
}
