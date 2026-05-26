import { View, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import {
  BRAND_ARIA_LABELS,
  BRAND_PATHS,
  getBrandIconDimensions,
  getBrandViewBox,
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
  const { width, height } = getBrandIconDimensions(brand, size);
  const viewBox = getBrandViewBox(brand);
  const paths = BRAND_PATHS[brand];

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={BRAND_ARIA_LABELS[brand]}
      style={[{ width, height }, style]}
    >
      <Svg
        width={width}
        height={height}
        viewBox={viewBox}
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
