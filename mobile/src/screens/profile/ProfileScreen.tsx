import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { preferenceLabel, useAppTheme } from '../../context/ThemeContext';
import { WEB_URL } from '../../config';
import type { AppThemeColors } from '../../lib/design';
import { formatLevel, formatTrack, getRankInfo } from '../../lib/design';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { RecentActivitySection } from '../../components/profile/RecentActivitySection';
import type { CompletedCourseSummary, LearnerDashboard } from '../../services/progress';
import { fetchLearnerDashboard } from '../../services/progress';
import { clearTokens } from '../../services/auth';
import { changePassword, deleteAccount, exportUserData, logoutAllSessions, updateDisplayName } from '../../services/api';
import {
  buildPointsRankNavSnapshot,
  formatLeaderboardRankLabel,
  writePointsRankNavCache,
} from '../../lib/points-rank-nav-badge';
import { writeStreakNavCache } from '../../lib/streak-nav-badge';
import { usePointsRankNav } from '../../hooks/usePointsRankNav';
import { fetchLeaderboard } from '../../services/gamification';

export function ProfileScreen() {
  const router = useRouter();
  const { colors, preference, cyclePreference } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const pointsRankNav = usePointsRankNav();
  const [dashboard, setDashboard] = useState<LearnerDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [displayNameDraft, setDisplayNameDraft] = useState('');
  const [displayNameError, setDisplayNameError] = useState<string | null>(null);
  const [isSavingName, setIsSavingName] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function loadProfile() {
    setLoading(true);
    const result = await fetchLearnerDashboard();
    setDashboard(result);
    writeStreakNavCache(result.data.learningStreak);
    if (result.source === 'api') {
      const leaderboard = await fetchLeaderboard();
      writePointsRankNavCache(
        buildPointsRankNavSnapshot(result.data.progress.points, leaderboard.data.currentUserRank),
      );
    }
    setLoading(false);
  }

  useEffect(() => {
    void loadProfile();
  }, []);

  useEffect(() => {
    if (dashboard) {
      setDisplayNameDraft(dashboard.data.user.displayName ?? '');
    }
  }, [dashboard?.data.user.displayName]);

  async function handleSaveDisplayName() {
    const trimmed = displayNameDraft.trim();
    if (!trimmed) {
      setDisplayNameError('Le nom d\'affichage est requis');
      return;
    }
    if (trimmed.length > 100) {
      setDisplayNameError('Le nom d\'affichage ne peut pas dépasser 100 caractères');
      return;
    }
    if (trimmed === (dashboard?.data.user.displayName ?? '').trim()) {
      setDisplayNameError(null);
      return;
    }

    setIsSavingName(true);
    setDisplayNameError(null);
    try {
      const user = await updateDisplayName(trimmed);
      setDashboard((current) =>
        current
          ? {
              ...current,
              data: {
                ...current.data,
                user: { ...current.data.user, displayName: user.displayName ?? trimmed },
              },
            }
          : current
      );
    } catch {
      setDisplayNameError('Impossible d\'enregistrer le nom. Réessaie.');
    } finally {
      setIsSavingName(false);
    }
  }

  function openWebPath(path: string) {
    void Linking.openURL(`${WEB_URL}${path}`);
  }

  async function handleSignOut() {
    await clearTokens();
    router.replace('/');
  }

  async function handleLogoutAllDevices() {
    setIsLoggingOutAll(true);
    try {
      await logoutAllSessions();
    } catch {
      // Révoque localement même si l’API échoue.
    } finally {
      await clearTokens();
      setIsLoggingOutAll(false);
      router.replace('/');
    }
  }

  async function handleExportData() {
    setIsExporting(true);
    try {
      const data = await exportUserData();
      await Share.share({
        message: JSON.stringify(data, null, 2),
        title: 'Export MDM Academy',
      });
    } catch {
      Alert.alert('Export impossible', 'Réessaie dans un instant ou vérifie ta connexion à l’API.');
    } finally {
      setIsExporting(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleteError(null);
    if (deleteConfirm.trim() !== 'SUPPRIMER') {
      setDeleteError('Saisis exactement SUPPRIMER pour confirmer.');
      return;
    }

    setIsDeleting(true);
    try {
      await deleteAccount('SUPPRIMER');
      await clearTokens();
      setShowDeleteModal(false);
      router.replace('/');
    } catch {
      setDeleteError('Impossible de supprimer le compte. Réessaie.');
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleChangePassword() {
    setPasswordError(null);

    if (!currentPassword.trim()) {
      setPasswordError('Indique ton mot de passe actuel.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('Le nouveau mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setIsSavingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      setPasswordError('Impossible de modifier le mot de passe. Vérifie ton mot de passe actuel.');
    } finally {
      setIsSavingPassword(false);
    }
  }

  if (loading || !dashboard) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.accent} />
        <Text style={styles.loadingText}>Chargement du profil…</Text>
      </View>
    );
  }

  const { data, source } = dashboard;
  const displayName = data.user.displayName ?? 'Apprenant';
  const rank = getRankInfo(data.progress.points);
  const previousFloor = rank.minPoints;
  const ceiling = rank.nextPoints ?? Math.max(previousFloor + 100, data.progress.points + 100);
  const span = Math.max(1, ceiling - previousFloor);
  const progressInRank = Math.max(0, Math.min(span, data.progress.points - previousFloor));
  const rankPercent = Math.round((progressInRank / span) * 100);
  const remainingPoints = rank.nextPoints != null ? Math.max(0, rank.nextPoints - data.progress.points) : 0;
  const completedCourses = data.completedCourses ?? [];
  const recentActivity = data.recentActivity ?? [];
  const leaderboardLabel =
    source === 'api' && pointsRankNav
      ? formatLeaderboardRankLabel(pointsRankNav.leaderboardRank)
      : 'Non classé';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>Mon profil</Text>
      {source === 'api' ? (
        <View style={styles.nameEditCard}>
          <Text style={styles.nameEditLabel}>Nom affiché</Text>
          <TextInput
            value={displayNameDraft}
            onChangeText={(text) => {
              setDisplayNameDraft(text);
              if (displayNameError) setDisplayNameError(null);
            }}
            maxLength={100}
            autoCapitalize="words"
            autoCorrect={false}
            accessibilityLabel="Nom affiché"
            style={[
              styles.nameEditInput,
              displayNameError ? styles.nameEditInputError : null,
            ]}
          />
          {displayNameError ? (
            <Text style={styles.nameEditError} accessibilityRole="alert">
              {displayNameError}
            </Text>
          ) : (
            <Text style={styles.nameEditHint}>Visible sur le profil et les certificats web.</Text>
          )}
          <Pressable
            style={[styles.nameEditButton, isSavingName ? styles.nameEditButtonDisabled : null]}
            onPress={() => void handleSaveDisplayName()}
            disabled={isSavingName}
            accessibilityRole="button"
            accessibilityLabel="Enregistrer le nom affiché"
          >
            <Text style={styles.nameEditButtonText}>
              {isSavingName ? 'Enregistrement…' : 'Enregistrer'}
            </Text>
          </Pressable>
        </View>
      ) : (
        <Text style={styles.title}>{displayName}</Text>
      )}

      <Pressable
        style={styles.themeCard}
        onPress={cyclePreference}
        accessibilityRole="button"
        accessibilityLabel={`Apparence : ${preferenceLabel(preference)}. Appuyer pour changer.`}
      >
        <Text style={styles.themeTitle}>Apparence</Text>
        <Text style={styles.themeValue}>{preferenceLabel(preference)}</Text>
        <Text style={styles.themeHint}>Clair, sombre ou suivre le système</Text>
      </Pressable>

      {source === 'demo' ? (
        <View style={styles.demoBanner}>
          <Text style={styles.demoText}>
            Mode démo — connecte-toi pour synchroniser ta progression sur le web.
          </Text>
        </View>
      ) : null}

      <View style={[styles.statsRecapCard, { backgroundColor: rank.gradient[0] }]}>
        <Text style={styles.statsRecapEyebrow}>Récap progression</Text>
        <View style={styles.statsRecapRow}>
          <Stat label="Points" value={String(data.progress.points)} styles={styles} />
          <Stat label="Rang" value={rank.name} styles={styles} />
          <Stat label="Classement" value={leaderboardLabel} styles={styles} />
        </View>
        {data.learningStreak ? (
          <View style={styles.statsRecapStreak}>
            <Text style={styles.statsRecapStreakText}>
              {'\u{1F525}'} {data.learningStreak.currentDays} jour
              {data.learningStreak.currentDays > 1 ? 's' : ''} consécutif
              {data.learningStreak.currentDays > 1 ? 's' : ''}
              {' · '}
              record {data.learningStreak.longestDays} j
            </Text>
          </View>
        ) : null}
        <ProgressBar
          progress={rankPercent}
          fillColor="#FFCE5B"
          trackColor="rgba(255,255,255,0.22)"
          styles={styles}
        />
        <Text style={styles.statsRecapMeta}>
          {rank.nextName
            ? `${remainingPoints} pts pour ${rank.nextName}`
            : 'Rang maximal atteint'}
          {' · '}
          Niv. {formatLevel(data.progress.level)} · {data.progress.completedModules}/
          {data.progress.totalModules} unités
        </Text>
        <Pressable
          style={styles.statsRecapLink}
          onPress={() => router.push('/leaderboard')}
          accessibilityRole="button"
          accessibilityLabel="Voir le classement complet"
        >
          <Text style={styles.statsRecapLinkText}>Voir le classement →</Text>
        </Pressable>
      </View>

      <RecentActivitySection items={recentActivity} />

      <Text style={styles.sectionTitle}>Certificats</Text>
      <Text style={styles.sectionHint}>
        {source === 'api'
          ? 'Parcours terminés — certificat imprimable sur le web'
          : 'Connecte-toi pour voir tes certificats synchronisés'}
      </Text>

      {completedCourses.length > 0 ? (
        <View style={styles.completedList}>
          {completedCourses.map((course) => (
            <CompletedCourseRow
              key={course.slug}
              course={course}
              styles={styles}
              onOpenCertificate={() => openWebPath(`/courses/${course.slug}/certificate`)}
            />
          ))}
        </View>
      ) : (
        <View style={styles.emptyCompletedCard}>
          <Text style={styles.emptyCompletedTitle}>Aucun certificat pour l’instant</Text>
          <Text style={styles.emptyCompletedText}>
            Valide toutes les unités d’un parcours pour débloquer ton certificat de complétion sur le web.
          </Text>
          <Pressable style={styles.catalogLink} onPress={() => router.push('/(tabs)/courses')}>
            <Text style={styles.catalogLinkText}>Explorer le catalogue →</Text>
          </Pressable>
        </View>
      )}

      <Text style={styles.sectionTitle}>Gamification</Text>
      <Text style={styles.sectionHint}>Badges, quêtes et sprint certification</Text>

      <Pressable style={styles.linkCard} onPress={() => router.push('/badges')}>
        <Text style={styles.linkTitle}>Mes badges</Text>
        <Text style={styles.linkHint}>Collection Apple, Jamf et Intune</Text>
        <Text style={styles.linkCta}>Voir les badges →</Text>
      </Pressable>

      <Pressable style={styles.linkCard} onPress={() => router.push('/sprint')}>
        <Text style={styles.linkTitle}>Sprint certification</Text>
        <Text style={styles.linkHint}>Préparation 7 ou 14 jours par piste</Text>
        <Text style={styles.linkCta}>Lancer un sprint →</Text>
      </Pressable>

      <Pressable style={styles.linkCard} onPress={() => router.push('/quests')}>
        <Text style={styles.linkTitle}>Quêtes hebdomadaires</Text>
        <Text style={styles.linkHint}>Défis de la semaine et récompenses bonus</Text>
        <Text style={styles.linkCta}>Voir les quêtes →</Text>
      </Pressable>

      <Pressable style={styles.linkCard} onPress={() => router.push('/leaderboard')}>
        <Text style={styles.linkTitle}>Classement</Text>
        <Text style={styles.linkHint}>Compare ta progression à la communauté</Text>
        <Text style={styles.linkCta}>Voir le classement →</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>Sur le web</Text>
      <Text style={styles.sectionHint}>Profil complet et diagnostics</Text>

      <Pressable style={styles.linkCard} onPress={() => openWebPath('/profile')}>
        <Text style={styles.linkTitle}>Profil apprenant</Text>
        <Text style={styles.linkHint}>Parcours, sprint et statistiques détaillées</Text>
        <Text style={styles.linkCta}>Ouvrir sur le web →</Text>
      </Pressable>

      <Pressable style={styles.linkCard} onPress={() => router.push('/diagnostics')}>
        <Text style={styles.linkTitle}>Diagnostics</Text>
        <Text style={styles.linkHint}>Santé API, version backend et URL configurée</Text>
        <Text style={styles.linkCta}>Ouvrir les diagnostics →</Text>
      </Pressable>

      <Pressable style={styles.linkCard} onPress={() => openWebPath('/soutenir')}>
        <Text style={styles.linkTitle}>Soutenir le projet</Text>
        <Text style={styles.linkHint}>Don volontaire — la formation reste 100 % gratuite</Text>
        <Text style={styles.linkCta}>Faire un don →</Text>
      </Pressable>

      <Pressable style={styles.linkCard} onPress={() => router.push('/about')}>
        <Text style={styles.linkTitle}>À propos</Text>
        <Text style={styles.linkHint}>Mission, vision et trois piliers MDM Academy</Text>
        <Text style={styles.linkCta}>En savoir plus →</Text>
      </Pressable>

      <Pressable onPress={loadProfile} style={styles.refreshButton}>
        <Text style={styles.refreshText}>Rafraîchir le profil</Text>
      </Pressable>

      {source === 'api' ? (
        <View style={styles.securityCard}>
          <Text style={styles.sectionTitle}>Sécurité</Text>
          <Text style={styles.sectionHint}>Mot de passe et sessions actives</Text>

          <Text style={styles.securityLabel}>Mot de passe actuel</Text>
          <TextInput
            value={currentPassword}
            onChangeText={(text) => {
              setCurrentPassword(text);
              if (passwordError) setPasswordError(null);
            }}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Mot de passe actuel"
            style={[styles.securityInput, passwordError ? styles.nameEditInputError : null]}
          />
          <Text style={styles.securityLabel}>Nouveau mot de passe</Text>
          <TextInput
            value={newPassword}
            onChangeText={(text) => {
              setNewPassword(text);
              if (passwordError) setPasswordError(null);
            }}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Nouveau mot de passe"
            style={styles.securityInput}
          />
          <Text style={styles.securityLabel}>Confirmer le mot de passe</Text>
          <TextInput
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (passwordError) setPasswordError(null);
            }}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Confirmer le mot de passe"
            style={styles.securityInput}
          />
          {passwordError ? (
            <Text style={styles.nameEditError} accessibilityRole="alert">
              {passwordError}
            </Text>
          ) : (
            <Text style={styles.nameEditHint}>Minimum 8 caractères pour les comptes e-mail.</Text>
          )}
          <Pressable
            style={[styles.nameEditButton, isSavingPassword ? styles.nameEditButtonDisabled : null]}
            onPress={() => void handleChangePassword()}
            disabled={isSavingPassword}
            accessibilityRole="button"
            accessibilityLabel="Changer le mot de passe"
          >
            <Text style={styles.nameEditButtonText}>
              {isSavingPassword ? 'Enregistrement…' : 'Changer le mot de passe'}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.logoutAllButton, isLoggingOutAll ? styles.nameEditButtonDisabled : null]}
            onPress={() => void handleLogoutAllDevices()}
            disabled={isLoggingOutAll}
            accessibilityRole="button"
            accessibilityLabel="Déconnecter tous les appareils"
          >
            <Text style={styles.logoutAllText}>
              {isLoggingOutAll ? 'Déconnexion…' : 'Déconnecter tous les appareils'}
            </Text>
          </Pressable>
        </View>
      ) : null}

      {source === 'api' ? (
        <View style={styles.personalDataCard}>
          <Text style={styles.sectionTitle}>Données personnelles</Text>
          <Text style={styles.sectionHint}>
            Export JSON et suppression de compte (RGPD)
          </Text>
          <Pressable
            style={[styles.nameEditButton, isExporting ? styles.nameEditButtonDisabled : null]}
            onPress={() => void handleExportData()}
            disabled={isExporting}
            accessibilityRole="button"
            accessibilityLabel="Exporter mes données"
          >
            <Text style={styles.nameEditButtonText}>
              {isExporting ? 'Export…' : 'Exporter mes données (JSON)'}
            </Text>
          </Pressable>
          <Pressable
            style={styles.deleteAccountButton}
            onPress={() => {
              setDeleteConfirm('');
              setDeleteError(null);
              setShowDeleteModal(true);
            }}
            accessibilityRole="button"
            accessibilityLabel="Supprimer mon compte"
          >
            <Text style={styles.deleteAccountText}>Supprimer mon compte</Text>
          </Pressable>
        </View>
      ) : null}

      <Pressable onPress={handleSignOut} style={styles.signOutButton}>
        <Text style={styles.signOutText}>Déconnexion</Text>
      </Pressable>

      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => !isDeleting && setShowDeleteModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Supprimer définitivement mon compte ?</Text>
            <Text style={styles.modalHint}>
              Action irréversible — progression, badges et quêtes seront effacés.
            </Text>
            <Text style={styles.securityLabel}>Saisis SUPPRIMER pour confirmer</Text>
            <TextInput
              value={deleteConfirm}
              onChangeText={(text) => {
                setDeleteConfirm(text);
                if (deleteError) setDeleteError(null);
              }}
              autoCapitalize="characters"
              autoCorrect={false}
              accessibilityLabel="Confirmation suppression compte"
              style={[styles.securityInput, deleteError ? styles.nameEditInputError : null]}
            />
            {deleteError ? (
              <Text style={styles.nameEditError} accessibilityRole="alert">
                {deleteError}
              </Text>
            ) : null}
            <Pressable
              style={[styles.deleteConfirmButton, isDeleting ? styles.nameEditButtonDisabled : null]}
              onPress={() => void handleDeleteAccount()}
              disabled={isDeleting}
            >
              <Text style={styles.deleteConfirmText}>
                {isDeleting ? 'Suppression…' : 'Confirmer la suppression'}
              </Text>
            </Pressable>
            <Pressable
              style={styles.modalCancelButton}
              onPress={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              <Text style={styles.modalCancelText}>Annuler</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function CompletedCourseRow({
  course,
  styles,
  onOpenCertificate,
}: {
  course: CompletedCourseSummary;
  styles: ReturnType<typeof createStyles>;
  onOpenCertificate: () => void;
}) {
  return (
    <Pressable
      style={styles.completedCard}
      onPress={onOpenCertificate}
      accessibilityRole="button"
      accessibilityLabel={`Voir le certificat pour ${course.title}`}
    >
      <Text style={styles.completedTitle}>{course.title}</Text>
      <Text style={styles.completedMeta}>
        {formatTrack(course.track)} · {formatCompletedDate(course.completedAt)}
      </Text>
      <Text style={styles.completedCta}>Voir le certificat sur le web →</Text>
    </Pressable>
  );
}

function formatCompletedDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'date à confirmer';
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function Stat({
  label,
  value,
  styles,
}: {
  label: string;
  value: string;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ProgressBar({
  progress,
  fillColor = '#34C759',
  trackColor = '#E5E5EA',
  styles,
}: {
  progress: number;
  fillColor?: string;
  trackColor?: string;
  styles: ReturnType<typeof createStyles>;
}) {
  const safeProgress = Math.max(0, Math.min(progress, 100));

  return (
    <View style={[styles.progressTrack, { backgroundColor: trackColor }]}>
      <View style={[styles.progressFill, { width: `${safeProgress}%`, backgroundColor: fillColor }]} />
    </View>
  );
}

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    content: { padding: 24, paddingBottom: 40 },
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
    loadingText: { marginTop: 12, color: colors.muted, fontSize: 15 },
    eyebrow: { color: colors.accent, fontSize: 13, fontWeight: '700', marginBottom: 4, textTransform: 'uppercase' },
    title: { color: colors.fg, fontSize: 28, fontWeight: '800', marginBottom: 16 },
    nameEditCard: {
      backgroundColor: colors.bgSoft,
      borderRadius: colors.radiusLg,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    nameEditLabel: {
      color: colors.muted,
      fontSize: 12,
      fontWeight: '800',
      textTransform: 'uppercase',
      marginBottom: 8,
    },
    nameEditInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      color: colors.fg,
      fontSize: 17,
      fontWeight: '700',
      backgroundColor: colors.bg,
    },
    nameEditInputError: {
      borderColor: '#dc2626',
    },
    nameEditHint: { color: colors.muted, marginTop: 8, fontSize: 13, lineHeight: 18 },
    nameEditError: { color: '#dc2626', marginTop: 8, fontSize: 13, fontWeight: '700' },
    nameEditButton: {
      marginTop: 12,
      alignSelf: 'flex-start',
      backgroundColor: colors.accent,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    nameEditButtonDisabled: { opacity: 0.6 },
    nameEditButtonText: { color: '#fff', fontWeight: '800', fontSize: 15 },
    themeCard: {
      backgroundColor: colors.bgSoft,
      borderRadius: colors.radiusLg,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    themeTitle: { color: colors.fg, fontSize: 17, fontWeight: '800' },
    themeValue: { color: colors.accent, fontWeight: '800', marginTop: 6, fontSize: 15 },
    themeHint: { color: colors.muted, marginTop: 4, fontSize: 13 },
    demoBanner: {
      backgroundColor: colors.demoBannerBg,
      borderRadius: 14,
      padding: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.demoBannerBorder,
    },
    demoText: { color: colors.demoBannerText, lineHeight: 20 },
    statsRecapCard: { borderRadius: 24, padding: 20, marginBottom: 24 },
    statsRecapEyebrow: {
      color: 'rgba(255,255,255,0.92)',
      fontSize: 12,
      fontWeight: '800',
      textTransform: 'uppercase',
      marginBottom: 12,
    },
    statsRecapRow: { flexDirection: 'row', gap: 8 },
    stat: { flex: 1, minWidth: 0 },
    statValue: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
    statLabel: { color: 'rgba(255,255,255,0.82)', marginTop: 4, fontSize: 12 },
    statsRecapStreak: { marginTop: 12 },
    statsRecapStreakText: { color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: '700' },
    progressTrack: { height: 8, borderRadius: 999, overflow: 'hidden', marginTop: 14 },
    progressFill: { height: '100%', borderRadius: 999 },
    statsRecapMeta: { color: 'rgba(255,255,255,0.78)', marginTop: 10, lineHeight: 18, fontSize: 13 },
    statsRecapLink: { marginTop: 12, alignSelf: 'flex-start' },
    statsRecapLinkText: { color: '#FFCE5B', fontWeight: '800', fontSize: 14 },
    sectionTitle: { color: colors.fg, fontSize: 20, fontWeight: '800' },
    sectionHint: { color: colors.muted, marginTop: 2, marginBottom: 12, fontSize: 13 },
    completedList: { gap: 10, marginBottom: 24 },
    completedCard: {
      backgroundColor: colors.bgSoft,
      borderRadius: 18,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    completedTitle: { color: colors.fg, fontSize: 17, fontWeight: '800' },
    completedMeta: { color: colors.muted, marginTop: 6, fontSize: 14 },
    completedCta: { color: colors.accent, marginTop: 10, fontSize: 14, fontWeight: '800' },
    emptyCompletedCard: {
      backgroundColor: colors.bgSoft,
      borderRadius: 18,
      padding: 16,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.border,
    },
    emptyCompletedTitle: { color: colors.fg, fontSize: 17, fontWeight: '800' },
    emptyCompletedText: { color: colors.muted, marginTop: 8, lineHeight: 20, fontSize: 14 },
    catalogLink: { marginTop: 12 },
    catalogLinkText: { color: colors.accent, fontWeight: '800', fontSize: 15 },
    linkCard: {
      backgroundColor: colors.bgSoft,
      borderRadius: 18,
      padding: 16,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    linkTitle: { color: colors.fg, fontSize: 17, fontWeight: '800' },
    linkHint: { color: colors.muted, marginTop: 4, lineHeight: 20, fontSize: 14 },
    linkCta: { color: colors.accent, fontWeight: '800', marginTop: 10, fontSize: 15 },
    refreshButton: { padding: 16, alignItems: 'center' },
    refreshText: { color: colors.accent, fontWeight: '700' },
    signOutButton: {
      marginTop: 8,
      padding: 14,
      borderRadius: 14,
      backgroundColor: colors.bgSoft,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    signOutText: { color: '#f87171', fontWeight: '800' },
    securityCard: {
      backgroundColor: colors.bgSoft,
      borderRadius: 18,
      padding: 16,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    securityLabel: {
      color: colors.muted,
      fontSize: 12,
      fontWeight: '800',
      textTransform: 'uppercase',
      marginTop: 10,
      marginBottom: 8,
    },
    securityInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      color: colors.fg,
      fontSize: 16,
      backgroundColor: colors.bg,
    },
    logoutAllButton: {
      marginTop: 16,
      padding: 14,
      borderRadius: 14,
      backgroundColor: colors.bg,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    logoutAllText: { color: colors.fg, fontWeight: '800' },
    personalDataCard: {
      backgroundColor: colors.bgSoft,
      borderRadius: 18,
      padding: 16,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    deleteAccountButton: {
      marginTop: 12,
      padding: 14,
      borderRadius: 14,
      backgroundColor: '#fef2f2',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#fecaca',
    },
    deleteAccountText: { color: '#dc2626', fontWeight: '800' },
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(15, 23, 42, 0.55)',
      justifyContent: 'center',
      padding: 24,
    },
    modalCard: {
      backgroundColor: colors.bg,
      borderRadius: 18,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    modalTitle: { color: colors.fg, fontSize: 18, fontWeight: '800' },
    modalHint: { color: colors.muted, marginTop: 10, lineHeight: 20, fontSize: 14 },
    deleteConfirmButton: {
      marginTop: 16,
      padding: 14,
      borderRadius: 14,
      backgroundColor: '#dc2626',
      alignItems: 'center',
    },
    deleteConfirmText: { color: '#fff', fontWeight: '800' },
    modalCancelButton: { marginTop: 10, padding: 12, alignItems: 'center' },
    modalCancelText: { color: colors.accent, fontWeight: '700' },
  });
}
