const OFFICIAL_LINKS = [
  {
    name: 'Apple Training & Certifications',
    url: 'https://training.apple.com',
    desc: 'Parcours et certifications officielles Apple',
  },
  {
    name: 'Jamf Learning Hub',
    url: 'https://learn.jamf.com',
    desc: 'Documentation et formations Jamf',
  },
  {
    name: 'Microsoft Intune',
    url: 'https://learn.microsoft.com/mem/intune/',
    desc: 'Gestion des appareils Apple avec Intune',
  },
  {
    name: 'ServiceNow Documentation',
    url: 'https://docs.servicenow.com',
    desc: 'ITSM, incidents et notes de résolution',
  },
];

export default function ResourcesPage() {
  return (
    <section style={{ padding: '2rem 0' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Ressources officielles</h1>
      <p style={{ color: 'var(--muted)', marginTop: '0.5rem', maxWidth: 640 }}>
        Les contenus pédagogiques de cette plateforme sont des résumés et exercices originaux.
        Consultez les sources officielles pour vérifier les informations à jour.
      </p>
      <ul style={{ marginTop: '2rem', listStyle: 'none', display: 'grid', gap: '1rem' }}>
        {OFFICIAL_LINKS.map((link) => (
          <li key={link.url} className="card">
            <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600, fontSize: '1.05rem' }}>
              {link.name} ↗
            </a>
            <p style={{ color: 'var(--muted)', marginTop: '0.35rem', fontSize: '0.95rem' }}>{link.desc}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
