import React, { useMemo } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  formatVideoDurationLabel,
  moduleHasVideo,
  parseVideoEmbed,
  type VideoProvider,
} from '@ama/shared/video-embed';
import type { AppThemeColors } from '../lib/design';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { ModuleAnimatedExplainer } from './ModuleAnimatedExplainer';

type ModuleVideoSectionProps = {
  videoUrl?: string | null;
  videoTitle?: string | null;
  videoDurationMinutes?: number | null;
  videoProvider?: VideoProvider;
  moduleTitle?: string;
};

function youtubeThumbnailId(url?: string | null, provider?: VideoProvider): string | null {
  const parsed = parseVideoEmbed(url, provider);
  if (parsed?.provider !== 'youtube' || !parsed.watchUrl) return null;
  const match = parsed.watchUrl.match(/v=([a-zA-Z0-9_-]{11})/);
  return match?.[1] ?? null;
}

export function ModuleVideoSection({
  videoUrl,
  videoTitle,
  videoDurationMinutes,
  videoProvider,
  moduleTitle,
}: ModuleVideoSectionProps) {
  const styles = useThemedStyles(createStyles);
  const parsed = useMemo(
    () => parseVideoEmbed(videoUrl, videoProvider),
    [videoUrl, videoProvider]
  );

  if (!moduleHasVideo({ videoUrl, videoProvider })) {
    return null;
  }

  const title = videoTitle ?? (moduleTitle ? `Vidéo : ${moduleTitle}` : 'Vidéo explicative');
  const durationLabel = formatVideoDurationLabel(videoDurationMinutes);
  const watchUrl = parsed?.watchUrl;
  const ytId = youtubeThumbnailId(videoUrl, videoProvider);

  const openVideo = () => {
    if (watchUrl) {
      void Linking.openURL(watchUrl);
    }
  };

  return (
    <View style={styles.root} accessibilityRole="summary" accessibilityLabel={title}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>
        {durationLabel ? <Text style={styles.duration}>{durationLabel}</Text> : null}
      </View>
      <Text style={styles.hint}>Regardez la vidéo, puis lisez la leçon et passez le quiz.</Text>

      {parsed?.provider === 'placeholder' || !parsed?.embedUrl ? (
        <ModuleAnimatedExplainer title={title} />
      ) : (
        <Pressable
          onPress={openVideo}
          disabled={!watchUrl}
          style={({ pressed }) => [styles.thumbnail, pressed && watchUrl ? styles.thumbnailPressed : null]}
          accessibilityRole="button"
          accessibilityLabel={watchUrl ? `Voir la vidéo — ${title}` : title}
        >
          <View style={styles.thumbnailInner}>
            {ytId ? (
              <Text style={styles.thumbnailEmoji} accessibilityElementsHidden>
                {'\u{25B6}\uFE0F'}
              </Text>
            ) : (
              <Text style={styles.thumbnailEmoji}>{'\u{1F3AC}'}</Text>
            )}
            <Text style={styles.thumbnailCta}>Voir la vidéo</Text>
            {ytId ? (
              <Text style={styles.thumbnailProvider} numberOfLines={1}>
                YouTube · {durationLabel ?? 'lecture externe'}
              </Text>
            ) : null}
          </View>
        </Pressable>
      )}
    </View>
  );
}

const createStyles = (colors: AppThemeColors) =>
  StyleSheet.create({
    root: {
      marginTop: 12,
      marginBottom: 8,
      gap: 8,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    title: {
      flex: 1,
      color: colors.fg,
      fontWeight: '800',
      fontSize: 15,
    },
    duration: {
      color: colors.muted,
      fontWeight: '700',
      fontSize: 12,
    },
    hint: {
      color: colors.muted,
      fontSize: 13,
      lineHeight: 18,
    },
    thumbnail: {
      aspectRatio: 16 / 9,
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: '#0f172a',
    },
    thumbnailPressed: {
      opacity: 0.88,
    },
    thumbnailInner: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      gap: 6,
    },
    thumbnailEmoji: {
      fontSize: 34,
    },
    thumbnailCta: {
      color: '#fff',
      fontWeight: '800',
      fontSize: 16,
    },
    thumbnailProvider: {
      color: 'rgba(255,255,255,0.78)',
      fontSize: 12,
    },
  });
