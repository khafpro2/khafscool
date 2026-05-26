import { LEARNING_PATHS } from '@/lib/learningPaths';

export function TracksComparisonTable() {
  return (
    <div className="tracks-comparison-wrap">
      <table className="tracks-comparison" aria-label="Comparaison des trois parcours MDM">
        <thead>
          <tr>
            <th scope="col">Piste</th>
            {LEARNING_PATHS.map((path) => (
              <th key={path.slug} scope="col">
                {path.shortTitle}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">Public cible</th>
            {LEARNING_PATHS.map((path) => (
              <td key={`${path.slug}-audience`}>{path.audience}</td>
            ))}
          </tr>
          <tr>
            <th scope="row">Durée estimée</th>
            {LEARNING_PATHS.map((path) => (
              <td key={`${path.slug}-duration`}>~{path.durationMinutes} min · {path.totalModules} unités</td>
            ))}
          </tr>
          <tr>
            <th scope="row">Certification visée</th>
            {LEARNING_PATHS.map((path) => (
              <td key={`${path.slug}-cert`}>{path.certificationTarget}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
