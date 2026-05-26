import { StyleSheet, View, type ViewStyle } from 'react-native';
import { BrandIcon, type BrandIconSize } from './BrandIcon';
import { getBrandIconDimensions } from '../lib/brands';
import { getTrackBrand, getTrackVisual } from '../lib/design';

interface TrackIconProps {
  track?: string | null;
  size?: BrandIconSize;
  style?: ViewStyle;
}

const SIZE_STYLES: Record<BrandIconSize, { box: number; radius: number }> = {
  sm: { box: 28, radius: 8 },
  md: { box: 40, radius: 12 },
  lg: { box: 56, radius: 16 },
};

export function TrackIcon({ track, size = 'md', style }: TrackIconProps) {
  const visual = getTrackVisual(track);
  const brand = visual.brand ?? getTrackBrand(track);
  const dimensions = SIZE_STYLES[size];
  const isJamf = brand === 'jamf';
  const iconDims = brand ? getBrandIconDimensions(brand, size) : null;
  const boxHeight = dimensions.box;
  const boxWidth = isJamf && iconDims ? Math.max(dimensions.box, iconDims.width + 8) : dimensions.box;

  return (
    <View
      style={[
        styles.base,
        {
          width: boxWidth,
          height: boxHeight,
          borderRadius: dimensions.radius,
          backgroundColor: visual.color,
        },
        style,
      ]}
    >
      {brand ? <BrandIcon brand={brand} size={size} variant="onColor" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
