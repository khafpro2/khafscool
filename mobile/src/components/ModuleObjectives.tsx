import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { AppThemeColors } from '../lib/design';
import { useThemedStyles } from '../hooks/useThemedStyles';

export function ModuleObjectives({
  learningObjectives,
  keyTakeaways,
}: {
  learningObjectives?: string[];
  keyTakeaways?: string[];
}) {
  const [expanded, setExpanded] = useState(false);
  const styles = useThemedStyles(createStyles);
  const objectives = learningObjectives?.length ? learningObjectives : null;
  const takeaways = keyTakeaways?.length ? keyTakeaways : null;

  if (!objectives && !takeaways) return null;

  return (
    <View style={styles.wrapper}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={() => setExpanded((current) => !current)}
        style={styles.summaryRow}
      >
        <Text style={styles.summaryIcon}>{expanded ? '\u25BE' : '\u25B8'}</Text>
        <Text style={styles.summaryText}>Objectifs et points clés du module</Text>
      </Pressable>
      {expanded ? (
        <View style={styles.body}>
          {objectives ? (
            <View style={styles.section}>
              <Text style={styles.label}>Objectifs d’apprentissage</Text>
              {objectives.map((item) => (
                <Text key={item} style={styles.listItem}>
                  {'\u2022'} {item}
                </Text>
              ))}
            </View>
          ) : null}
          {takeaways ? (
            <View style={styles.section}>
              <Text style={styles.label}>Points clés à retenir</Text>
              {takeaways.map((item) => (
                <Text key={item} style={styles.listItem}>
                  {'\u2022'} {item}
                </Text>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const createStyles = (colors: AppThemeColors) =>
  StyleSheet.create({
    wrapper: {
      marginTop: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.bgSoft,
      overflow: 'hidden',
    },
    summaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    summaryIcon: {
      color: colors.muted,
      fontSize: 14,
      fontWeight: '800',
      width: 14,
    },
    summaryText: {
      flex: 1,
      color: colors.fg,
      fontSize: 13,
      fontWeight: '700',
    },
    body: {
      paddingHorizontal: 12,
      paddingBottom: 12,
      gap: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    section: { gap: 6, marginTop: 10 },
    label: {
      color: colors.muted,
      fontSize: 11,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    listItem: {
      color: colors.fg,
      fontSize: 13,
      lineHeight: 19,
      paddingLeft: 2,
    },
  });
