import React from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import {
  isBonnePratiqueBlockquote,
  parseInlineMarkdown,
  parseLessonBlocks,
} from '@ama/shared/lesson-markdown';
import type { AppThemeColors } from '../lib/design';
import { useThemedStyles } from '../hooks/useThemedStyles';

function InlineText({ text, styles }: { text: string; styles: ReturnType<typeof createStyles> }) {
  return (
    <>
      {parseInlineMarkdown(text).map((part, index) => {
        if (part.type === 'strong') {
          return (
            <Text key={index} style={styles.lessonStrong}>
              {part.value}
            </Text>
          );
        }
        if (part.type === 'link') {
          return (
            <Text
              key={index}
              style={styles.lessonLink}
              accessibilityRole="link"
              onPress={() => void Linking.openURL(part.href)}
            >
              {part.label}
            </Text>
          );
        }
        return part.value;
      })}
    </>
  );
}

export function LessonContent({ content }: { content: string }) {
  const styles = useThemedStyles(createStyles);
  if (!content.trim()) return null;

  const blocks = parseLessonBlocks(content);

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>Leçon</Text>
      {blocks.map((block, index) => {
        if (block.type === 'h2') {
          return (
            <Text key={index} style={styles.h2}>
              <InlineText text={block.text} styles={styles} />
            </Text>
          );
        }
        if (block.type === 'h3') {
          return (
            <Text key={index} style={styles.h3}>
              <InlineText text={block.text} styles={styles} />
            </Text>
          );
        }
        if (block.type === 'blockquote') {
          const isBonnePratique = isBonnePratiqueBlockquote(block.text);
          const body = block.text.replace(/^\*\*Bonne pratique\s*:\*\*\s*/i, '');
          return (
            <View key={index} style={isBonnePratique ? styles.tip : styles.quote}>
              {isBonnePratique ? <Text style={styles.tipLabel}>Bonne pratique</Text> : null}
              <Text style={styles.paragraph}>
                <InlineText text={body} styles={styles} />
              </Text>
            </View>
          );
        }
        if (block.type === 'ul') {
          return (
            <View key={index} style={styles.list}>
              {block.items.map((item, itemIndex) => (
                <Text key={itemIndex} style={styles.listItem}>
                  {'\u2022 '}
                  <InlineText text={item} styles={styles} />
                </Text>
              ))}
            </View>
          );
        }
        return (
          <Text key={index} style={styles.paragraph}>
            <InlineText text={block.text} styles={styles} />
          </Text>
        );
      })}
    </View>
  );
}

const createStyles = (colors: AppThemeColors) =>
  StyleSheet.create({
    container: {
      marginTop: 12,
      padding: 14,
      borderRadius: 12,
      backgroundColor: colors.bgSoft,
      borderWidth: 1,
      borderColor: colors.border,
    },
    eyebrow: {
      fontWeight: '800',
      fontSize: 12,
      textTransform: 'uppercase',
      letterSpacing: 1,
      color: colors.muted,
      marginBottom: 10,
    },
    h2: {
      fontSize: 17,
      fontWeight: '800',
      color: colors.fg,
      marginTop: 12,
      marginBottom: 6,
    },
    h3: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.fg,
      marginTop: 10,
      marginBottom: 4,
    },
    paragraph: {
      fontSize: 14,
      lineHeight: 22,
      color: colors.fg,
      marginTop: 6,
    },
    list: {
      marginTop: 6,
      gap: 4,
    },
    listItem: {
      fontSize: 14,
      lineHeight: 21,
      color: colors.fg,
      paddingLeft: 4,
    },
    quote: {
      marginTop: 8,
      paddingLeft: 12,
      borderLeftWidth: 3,
      borderLeftColor: colors.border,
    },
    tip: {
      marginTop: 10,
      padding: 12,
      borderRadius: 10,
      backgroundColor: colors.accentTealSoft,
      borderWidth: 1,
      borderColor: colors.success,
    },
    tipLabel: {
      fontSize: 11,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      color: colors.success,
      marginBottom: 4,
    },
    lessonStrong: {
      fontWeight: '800',
    },
    lessonLink: {
      color: colors.accent,
      fontWeight: '700',
      textDecorationLine: 'underline',
    },
  });
