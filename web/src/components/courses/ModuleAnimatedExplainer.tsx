'use client';

import styles from './ModuleAnimatedExplainer.module.css';

/** Animation SVG légère : achat ABM → serveur MDM → appareil supervisé. */
export function ModuleAnimatedExplainer({ title }: { title?: string }) {
  return (
    <div className={styles.root} role="img" aria-label={title ?? 'Schéma animé du flux ABM vers MDM'}>
      <svg viewBox="0 0 640 220" className={styles.svg} aria-hidden>
        <defs>
          <linearGradient id="ama-flow-accent" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>

        <rect className={styles.node} x="24" y="64" width="150" height="92" rx="14" />
        <text className={styles.label} x="99" y="104">
          Apple Business
        </text>
        <text className={styles.sublabel} x="99" y="128">
          Manager
        </text>

        <rect className={styles.node} x="245" y="64" width="150" height="92" rx="14" />
        <text className={styles.label} x="320" y="104">
          Serveur MDM
        </text>
        <text className={styles.sublabel} x="320" y="128">
          Jamf / Intune
        </text>

        <rect className={styles.nodeAccent} x="466" y="64" width="150" height="92" rx="14" />
        <text className={styles.labelLight} x="541" y="104">
          Appareil
        </text>
        <text className={styles.sublabelLight} x="541" y="128">
          Supervisé
        </text>

        <path className={styles.arrow} d="M 178 110 H 238" />
        <path className={styles.arrowDelay} d="M 399 110 H 459" />

        <circle className={styles.pulse} cx="208" cy="110" r="6" />
        <circle className={styles.pulseDelay} cx="429" cy="110" r="6" />
      </svg>
      <p className={styles.caption}>Flux simplifié : achat ABM → assignation MDM → enrôlement ADE à l&apos;assistant de configuration.</p>
    </div>
  );
}
