import Link from 'next/link';

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Fil d'Ariane" className="breadcrumbs">
      <ol className="breadcrumbs-list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="breadcrumbs-item">
              {item.href && !isLast ? (
                <Link href={item.href} className="breadcrumbs-link">
                  {item.label}
                </Link>
              ) : (
                <span className="breadcrumbs-current" aria-current={isLast ? 'page' : undefined}>
                  {item.label}
                </span>
              )}
              {!isLast ? (
                <span className="breadcrumbs-separator" aria-hidden>
                  ›
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
