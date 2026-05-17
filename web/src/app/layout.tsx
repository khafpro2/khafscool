import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Apple MDM Academy',
  description: 'Formation gamifiée pour techniciens Apple et administrateurs MDM',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <header className="container">
          <nav className="nav">
            <Link href="/">Accueil</Link>
            <Link href="/auth">Connexion</Link>
            <Link href="/pricing">Tarifs</Link>
            <Link href="/dashboard">Tableau de bord</Link>
            <Link href="/courses">Parcours</Link>
            <Link href="/resources">Ressources</Link>
          </nav>
        </header>
        <main className="container">{children}</main>
        <footer className="container" style={{ marginTop: '4rem', paddingBottom: '2rem', color: 'var(--muted)', fontSize: '0.875rem' }}>
          Non affilié à Apple Inc., Jamf, Microsoft ou ServiceNow.
        </footer>
      </body>
    </html>
  );
}
