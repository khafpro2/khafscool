import React, { useMemo } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import {
  canEmbedExternalVideo,
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

function localVideoPageHtml(videoUrl: string, title: string): string {
  const safeTitle = title.replace(/"/g, '&quot;');
  return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1" /><style>
    html,body{margin:0;background:#0f172a;height:100%;display:flex;align-items:center;justify-content:center}
    video{width:100%;max-height:100vh;background:#000}
  </style></head><body>
    <video controls playsinline preload="metadata" title="${safeTitle}" aria-label="${safeTitle}">
      <source src="${videoUrl}" type="video/mp4" />
    </video>
  </body></html>`;
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
  const localVideoSrc = parsed?.provider === 'mp4' ? parsed.embedUrl : null;
  const hasHeyGenFrenchVideo = Boolean(videoHeyGenFrUrl?.trim());
  const hasFrenchDub =
    !hasHeyGenFrenchVideo && Boolean(videoDubFrUrl?.trim()) && Boolean(localVideoSrc);
  const allowExternalEmbed = canEmbedExternalVideo(videoSourceLanguage);
  const showFrenchPending =
    parsed?.provider === 'placeholder' ||
    !parsed?.embedUrl ||
    ((parsed?.provider === 'youtube' || parsed?.provider === 'vimeo') && !allowExternalEmbed);
  const syncedWebUrl = courseSlug ? `${WEB_URL}/courses/${courseSlug}` : null;
  const heyGenVideoUrl = videoHeyGenFrUrl ? `${WEB_URL}${videoHeyGenFrUrl}` : null;
  const localVideoUrl = localVideoSrc ? `${WEB_URL}${localVideoSrc}` : null;

  const openCourseWeb = () => {
    if (syncedWebUrl) {
      void Linking.openURL(syncedWebUrl);
    }
  };

  const openHeyGenVideo = () => {
    if (heyGenVideoUrl) {
      void Linking.openURL(heyGenVideoUrl);
    } else if (syncedWebUrl) {
      void Linking.openURL(syncedWebUrl);
    }
  };

  return (
    <View style={styles.root} accessibilityRole="summary" accessibilityLabel={title}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.badgeRow}>
          <Text style={styles.frenchBadge}>{'\u{1F1EB}\u{1F1F7}'} Français</Text>
          {durationLabel ? <Text style={styles.duration}>{durationLabel}</Text> : null}
        </View>
      </View>

      <Text style={styles.hint}>
        {showFrenchPending
          ? 'Vidéo française bientôt disponible — schéma animé et leçon ci-dessous.'
          : hasHeyGenFrenchVideo
            ? 'Vidéo française (voix Lifa) — hébergée sur le site web.'
            : hasFrenchDub
              ? 'Doublage synchronisé disponible sur le site web (vidéo locale + voix Lifa).'
              : 'Regardez la vidéo, puis lisez la leçon et passez le quiz.'}
      </Text>

      {hasHeyGenFrenchVideo ? (
        <View style={styles.dubBlock}>
          {localVideoUrl && !showFrenchPending ? (
            <View style={styles.embedFrame} accessibilityLabel={ariaLabel}>
              <WebView
                source={{ html: localVideoPageHtml(heyGenVideoUrl ?? localVideoUrl, title) }}
                style={styles.webview}
                allowsFullscreenVideo
                mediaPlaybackRequiresUserAction
                javaScriptEnabled
                allowsInlineMediaPlayback
                scrollEnabled={false}
              />
            </View>
          ) : (
            <ModuleAnimatedExplainer title={title} />
          )}
          <Pressable
            onPress={openHeyGenVideo}
            disabled={!heyGenVideoUrl && !syncedWebUrl}
            style={({ pressed }) => [styles.dubButton, pressed ? styles.thumbnailPressed : null]}
            accessibilityRole="button"
            accessibilityLabel={`Voir la vidéo française — ${title}`}
          >
            <Text style={styles.dubButtonEmoji}>{'\u{1F3AC}\uFE0F'}</Text>
            <Text style={styles.dubButtonText}>Ouvrir la vidéo en français</Text>
            <Text style={styles.dubButtonSub}>Voix Lifa — sans YouTube</Text>
          </Pressable>
        </View>
      ) : hasFrenchDub ? (
        <View style={styles.dubBlock}>
          <ModuleAnimatedExplainer title={title} />
          <Pressable
            onPress={openCourseWeb}
            disabled={!syncedWebUrl}
            style={({ pressed }) => [styles.dubButton, pressed ? styles.thumbnailPressed : null]}
            accessibilityRole="button"
            accessibilityLabel={`Voir avec doublage français — ${title}`}
          >
            <Text style={styles.dubButtonEmoji}>{'\u{1F399}\uFE0F'}</Text>
            <Text style={styles.dubButtonText}>Voir avec doublage français</Text>
            <Text style={styles.dubButtonSub}>Vidéo locale + voix synchronisée</Text>
          </Pressable>
        </View>
      ) : showFrenchPending ? (
        <ModuleAnimatedExplainer title={title} />
      ) : parsed?.provider === 'mp4' && localVideoUrl ? (
        <View style={styles.embedFrame} accessibilityLabel={ariaLabel}>
          <WebView
            source={{ html: localVideoPageHtml(localVideoUrl, title) }}
            style={styles.webview}
            allowsFullscreenVideo
            mediaPlaybackRequiresUserAction
            javaScriptEnabled
            allowsInlineMediaPlayback
            scrollEnabled={false}
          />
        </View>
      ) : (
        <ModuleAnimatedExplainer title={title} />
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
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 8,
    },
    title: {
      flex: 1,
      color: colors.fg,
      fontWeight: '800',
      fontSize: 15,
    },
    badgeRow: {
      alignItems: 'flex-end',
      gap: 4,
    },
    frenchBadge: {
      color: colors.accent,
      fontWeight: '800',
      fontSize: 11,
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
    thumbnailPressed: {
      opacity: 0.88,
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
