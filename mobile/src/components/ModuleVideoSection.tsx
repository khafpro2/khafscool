import React, { useMemo } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import {
  formatVideoDurationLabel,
  moduleHasVideo,
  parseVideoEmbed,
  type VideoProvider,
} from '@ama/shared/video-embed';
import { WEB_URL } from '../config';
import type { AppThemeColors } from '../lib/design';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { ModuleAnimatedExplainer } from './ModuleAnimatedExplainer';

type ModuleVideoSectionProps = {
  courseSlug?: string;
  videoUrl?: string | null;
  videoTitle?: string | null;
  videoDurationMinutes?: number | null;
  videoProvider?: VideoProvider;
  videoSourceLanguage?: 'fr' | 'en' | null;
  videoTranscriptFr?: string | null;
  videoHeyGenFrUrl?: string | null;
  videoDubFrUrl?: string | null;
  moduleTitle?: string;
};

function youtubeThumbnailId(url?: string | null, provider?: VideoProvider): string | null {
  const parsed = parseVideoEmbed(url, provider, { locale: 'fr' });
  if (parsed?.provider !== 'youtube' || !parsed.watchUrl) return null;
  const match = parsed.watchUrl.match(/v=([a-zA-Z0-9_-]{11})/);
  return match?.[1] ?? null;
}

export function ModuleVideoSection({
  courseSlug,
  videoUrl,
  videoTitle,
  videoDurationMinutes,
  videoProvider,
  videoSourceLanguage,
  videoTranscriptFr,
  videoHeyGenFrUrl,
  videoDubFrUrl,
  moduleTitle,
}: ModuleVideoSectionProps) {
  const styles = useThemedStyles(createStyles);
  const [transcriptOpen, setTranscriptOpen] = React.useState(false);
  const parsed = useMemo(
    () => parseVideoEmbed(videoUrl, videoProvider, { locale: 'fr' }),
    [videoUrl, videoProvider]
  );

  if (!moduleHasVideo({ videoUrl, videoProvider })) {
    return null;
  }

  const title = videoTitle ?? (moduleTitle ? `Vidéo : ${moduleTitle}` : 'Vidéo explicative');
  const durationLabel = formatVideoDurationLabel(videoDurationMinutes);
  const ariaLabel = durationLabel ? `${title} — ${durationLabel}` : title;
  const watchUrl = parsed?.watchUrl;
  const ytId = youtubeThumbnailId(videoUrl, videoProvider);
  const hasHeyGenFrenchVideo = Boolean(videoHeyGenFrUrl?.trim());
  const hasFrenchDub =
    !hasHeyGenFrenchVideo &&
    Boolean(videoDubFrUrl?.trim()) &&
    parsed?.provider === 'youtube' &&
    Boolean(ytId);
  const syncedWebUrl = courseSlug ? `${WEB_URL}/courses/${courseSlug}` : null;
  const heyGenVideoUrl = videoHeyGenFrUrl ? `${WEB_URL}${videoHeyGenFrUrl}` : null;

  const openHeyGenVideo = () => {
    if (heyGenVideoUrl) {
      void Linking.openURL(heyGenVideoUrl);
    } else if (syncedWebUrl) {
      void Linking.openURL(syncedWebUrl);
    }
  };

  const openSyncedDub = () => {
    if (syncedWebUrl) {
      void Linking.openURL(syncedWebUrl);
    }
  };

  const openOriginalVideo = () => {
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

      <Text style={styles.hint}>
        {hasHeyGenFrenchVideo
          ? 'Vidéo entièrement doublée en français (HeyGen). Ouvrez la version FR sur le site web.'
          : hasFrenchDub
            ? 'Le doublage français remplace le son original sur le site web. Ouvrez le parcours dans le navigateur.'
            : 'Regardez la vidéo, puis lisez la leçon et passez le quiz.'}
        {!hasHeyGenFrenchVideo && !hasFrenchDub && videoSourceLanguage === 'en'
          ? ' Sous-titres FR disponibles dans YouTube (CC).'
          : ''}
      </Text>

      {hasHeyGenFrenchVideo ? (
        <View style={styles.dubBlock}>
          <ModuleAnimatedExplainer title={title} />
          <Pressable
            onPress={openHeyGenVideo}
            disabled={!heyGenVideoUrl && !syncedWebUrl}
            style={({ pressed }) => [styles.dubButton, pressed ? styles.thumbnailPressed : null]}
            accessibilityRole="button"
            accessibilityLabel={`Voir la vidéo française HeyGen — ${title}`}
          >
            <Text style={styles.dubButtonEmoji}>{'\u{1F3AC}\uFE0F'}</Text>
            <Text style={styles.dubButtonText}>Voir la vidéo en français</Text>
            <Text style={styles.dubButtonSub}>Doublage HeyGen — image et voix synchronisées</Text>
          </Pressable>
          {watchUrl ? (
            <Pressable onPress={openOriginalVideo} accessibilityRole="link">
              <Text style={styles.originalLink}>Version anglaise sur YouTube</Text>
            </Pressable>
          ) : null}
        </View>
      ) : hasFrenchDub ? (
        <View style={styles.dubBlock}>
          <ModuleAnimatedExplainer title={title} />
          <Pressable
            onPress={openSyncedDub}
            disabled={!syncedWebUrl}
            style={({ pressed }) => [styles.dubButton, pressed ? styles.thumbnailPressed : null]}
            accessibilityRole="button"
            accessibilityLabel={`Voir avec doublage français — ${title}`}
          >
            <Text style={styles.dubButtonEmoji}>{'\u{1F399}\uFE0F'}</Text>
            <Text style={styles.dubButtonText}>Voir avec doublage français</Text>
            <Text style={styles.dubButtonSub}>Vidéo muette + voix off synchronisée</Text>
          </Pressable>
          {watchUrl ? (
            <Pressable onPress={openOriginalVideo} accessibilityRole="link">
              <Text style={styles.originalLink}>Version anglaise sur YouTube</Text>
            </Pressable>
          ) : null}
        </View>
      ) : parsed?.provider === 'placeholder' || !parsed?.embedUrl ? (
        <ModuleAnimatedExplainer title={title} />
      ) : (
        <View style={styles.embedFrame} accessibilityLabel={ariaLabel}>
          <WebView
            source={{ uri: parsed.embedUrl }}
            style={styles.webview}
            allowsFullscreenVideo
            mediaPlaybackRequiresUserAction
            javaScriptEnabled
            allowsInlineMediaPlayback
            scrollEnabled={false}
          />
        </View>
      )}

      {videoTranscriptFr ? (
        <View style={styles.transcriptBlock}>
          <Pressable
            onPress={() => setTranscriptOpen((open) => !open)}
            accessibilityRole="button"
            accessibilityState={{ expanded: transcriptOpen }}
            accessibilityLabel="Transcription en français"
          >
            <Text style={styles.transcriptToggle}>
              {transcriptOpen ? 'Masquer la transcription en français' : 'Transcription en français'}
            </Text>
          </Pressable>
          {transcriptOpen ? (
            <Text style={styles.transcriptBody}>{videoTranscriptFr.replace(/\*\*/g, '')}</Text>
          ) : null}
        </View>
      ) : null}
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
    dubBlock: {
      gap: 10,
    },
    dubButton: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.accent,
      backgroundColor: colors.accentSoft,
      paddingVertical: 14,
      paddingHorizontal: 16,
      alignItems: 'center',
      gap: 4,
    },
    dubButtonEmoji: {
      fontSize: 28,
    },
    dubButtonText: {
      color: colors.accent,
      fontWeight: '800',
      fontSize: 15,
    },
    dubButtonSub: {
      color: colors.muted,
      fontWeight: '600',
      fontSize: 12,
      textAlign: 'center',
    },
    originalLink: {
      color: colors.accent,
      fontWeight: '700',
      fontSize: 13,
      textAlign: 'center',
      textDecorationLine: 'underline',
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
    embedFrame: {
      aspectRatio: 16 / 9,
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: '#0f172a',
    },
    webview: {
      flex: 1,
      backgroundColor: '#000',
    },
    transcriptBlock: {
      marginTop: 4,
      gap: 8,
    },
    transcriptToggle: {
      color: colors.accent,
      fontWeight: '700',
      fontSize: 14,
    },
    transcriptBody: {
      color: colors.fg,
      fontSize: 14,
      lineHeight: 21,
    },
  });
