import { BrandIcon } from '@/components/ui/BrandIcon';
import type { BrandId } from '@/lib/brands';

interface BadgeIconProps {
  brand?: BrandId;
  icon?: string;
  size?: 'sm' | 'md';
}

export function BadgeIcon({ brand, icon, size = 'sm' }: BadgeIconProps) {
  if (brand) {
    return <BrandIcon brand={brand} size={size === 'sm' ? 'sm' : 'md'} />;
  }
  if (icon) {
    return <span aria-hidden>{icon}</span>;
  }
  return null;
}
