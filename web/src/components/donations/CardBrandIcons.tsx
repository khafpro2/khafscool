type CardBrandIconsProps = {
  className?: string;
};

/** Icônes discrètes Visa / Mastercard pour la section don CB. */
export function CardBrandIcons({ className }: CardBrandIconsProps) {
  return (
    <div
      className={className}
      aria-hidden
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        opacity: 0.72,
      }}
    >
      <span className="donation-card-brand donation-card-brand--visa">Visa</span>
      <span className="donation-card-brand donation-card-brand--mastercard">Mastercard</span>
      <span className="donation-card-brand donation-card-brand--amex">Amex</span>
    </div>
  );
}
