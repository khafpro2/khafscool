import { StyleSheet, View, type ViewStyle } from 'react-native';
import { BrandIcon, type BrandIconSize } from './BrandIcon';
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

  return (
    <View
      style={[
        styles.base,
        {
          width: dimensions.box,
          height: dimensions.box,
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
    overflow: 'hidden',
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
