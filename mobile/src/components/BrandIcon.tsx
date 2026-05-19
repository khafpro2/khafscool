import { View, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import {
  BRAND_ARIA_LABELS,
  BRAND_PATHS,
  BRAND_SIZE_PX,
  BRAND_VIEWBOX,
  resolveBrandPathFill,
  type BrandId,
  type BrandIconSize,
} from '../lib/brands';

export type { BrandIconSize };

interface BrandIconProps {
  brand: BrandId;
  size?: BrandIconSize;
  variant?: 'default' | 'onColor';
  style?: ViewStyle;
}

export function BrandIcon({ brand, size = 'md', variant = 'default', style }: BrandIconProps) {
  const px = BRAND_SIZE_PX[size];
  const paths = BRAND_PATHS[brand];

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={BRAND_ARIA_LABELS[brand]}
      style={[{ width: px, height: px }, style]}
    >
      <Svg
        width={px}
        height={px}
        viewBox={BRAND_VIEWBOX}
        preserveAspectRatio="xMidYMid meet"
      >
        {paths.map((path, index) => (
          <Path
            key={index}
            d={path.d}
            fill={resolveBrandPathFill(brand, path, variant)}
          />
        ))}
      </Svg>
    </View>
  );
}
