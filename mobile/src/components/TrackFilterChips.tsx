import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { AppThemeColors } from '../lib/design';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { TRACK_FILTERS, formatTrackFilter, type TrackFilter } from '../lib/track-filters';

type TrackFilterChipsProps = {
  selected: TrackFilter;
  onSelect: (track: TrackFilter) => void;
  label?: string;
};

export function TrackFilterChips({ selected, onSelect, label = 'Piste' }: TrackFilterChipsProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        {TRACK_FILTERS.map((track) => {
          const isSelected = track === selected;
          return (
            <Pressable
              key={track}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              onPress={() => onSelect(track)}
              style={[styles.chip, isSelected ? styles.chipSelected : null]}
            >
              <Text style={[styles.chipText, isSelected ? styles.chipTextSelected : null]}>
                {formatTrackFilter(track)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
    container: { marginBottom: 16 },
    label: {
      color: colors.muted,
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 0.6,
      marginBottom: 8,
      textTransform: 'uppercase',
    },
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
      backgroundColor: colors.bgSoft,
      borderColor: colors.border,
      borderRadius: colors.radiusPill,
      borderWidth: 1,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    chipSelected: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    chipText: {
      color: colors.fg,
      fontSize: 13,
      fontWeight: '700',
    },
    chipTextSelected: {
      color: '#FFFFFF',
    },
  });
}
