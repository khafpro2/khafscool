import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type View as ViewType,
} from 'react-native';
import { MDM_GLOSSARY, searchGlossary, type GlossaryTerm } from '@ama/shared/glossary';
import { useAppTheme } from '../../context/ThemeContext';
import type { AppThemeColors } from '../../lib/design';
import { useThemedStyles } from '../../hooks/useThemedStyles';

const CATEGORY_COLORS: Record<GlossaryTerm['category'], { bg: string; text: string }> = {
  Apple: { bg: '#E8F4FD', text: '#0A4A7A' },
  Jamf: { bg: '#FFF4E5', text: '#9A4D00' },
  Intune: { bg: '#EEF2FF', text: '#3730A3' },
  MDM: { bg: '#ECFDF5', text: '#047857' },
  Sécurité: { bg: '#FEF2F2', text: '#B91C1C' },
};

export function GlossaryScreen() {
  const router = useRouter();
  const { term } = useLocalSearchParams<{ term?: string | string[] }>();
  const scrollRef = useRef<ScrollView>(null);
  const termRefs = useRef<Record<string, ViewType | null>>({});
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GlossaryTerm['category'] | 'ALL'>('ALL');
  const focusTermId = typeof term === 'string' ? term : Array.isArray(term) ? term[0] : undefined;

  const categories = useMemo(
    () => Array.from(new Set(MDM_GLOSSARY.map((entry) => entry.category))).sort(),
    []
  );

  const visibleTerms = useMemo(() => {
    const searched = searchGlossary(query);
    if (selectedCategory === 'ALL') return searched;
    return searched.filter((entry) => entry.category === selectedCategory);
  }, [query, selectedCategory]);

  useEffect(() => {
    if (!focusTermId) return;
    setQuery('');
    setSelectedCategory('ALL');
  }, [focusTermId]);

  useEffect(() => {
    if (!focusTermId) return;
    const target = termRefs.current[focusTermId];
    if (!target) return;
    const timer = setTimeout(() => {
      target.measureLayout(
        scrollRef.current?.getInnerViewNode?.() as number,
        (_x, y) => scrollRef.current?.scrollTo({ y: Math.max(0, y - 24), animated: true }),
        () => undefined
      );
    }, 250);
    return () => clearTimeout(timer);
  }, [focusTermId, visibleTerms]);

  return (
    <ScrollView ref={scrollRef} style={styles.container} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.back()} style={styles.backLink}>
        <Text style={styles.backLinkText}>← Retour</Text>
      </Pressable>

      <View style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>{'\u{1F4D6}'} Référence MDM</Text>
        <Text style={styles.heroTitle}>Glossaire MDM Apple, Jamf et Intune</Text>
        <Text style={styles.heroCopy}>
          {MDM_GLOSSARY.length} termes en français — ABM, ADE, supervision, Smart Groups, conformité…
        </Text>
      </View>

      <View style={styles.searchCard}>
        <Text style={styles.searchLabel}>Rechercher un terme</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="SCEP, wipe sélectif, VPP…"
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Rechercher un terme du glossaire"
          style={styles.searchInput}
        />
        <Text style={styles.filterLabel}>Filtrer par catégorie</Text>
        <View style={styles.chipRow}>
          <CategoryChip
            label="Toutes"
            selected={selectedCategory === 'ALL'}
            onPress={() => setSelectedCategory('ALL')}
            styles={styles}
          />
          {categories.map((category) => (
            <CategoryChip
              key={category}
              label={category}
              selected={selectedCategory === category}
              onPress={() => setSelectedCategory(category)}
              styles={styles}
            />
          ))}
        </View>
      </View>

      {visibleTerms.length > 0 ? (
        <View style={styles.termList}>
          {visibleTerms.map((entry) => (
            <GlossaryTermCard
              key={entry.id}
              entry={entry}
              styles={styles}
              highlighted={entry.id === focusTermId}
              cardRef={(node) => {
                termRefs.current[entry.id] = node;
              }}
            />
          ))}
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Aucun terme ne correspond</Text>
          <Text style={styles.emptyText}>Essaie un autre mot-clé ou réinitialise les filtres.</Text>
          <Pressable
            style={styles.resetButton}
            onPress={() => {
              setQuery('');
              setSelectedCategory('ALL');
            }}
          >
            <Text style={styles.resetButtonText}>Réinitialiser</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

function CategoryChip({
  label,
  selected,
  onPress,
  styles,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected ? styles.chipSelected : null]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text style={[styles.chipText, selected ? styles.chipTextSelected : null]}>{label}</Text>
    </Pressable>
  );
}

function GlossaryTermCard({
  entry,
  styles,
  highlighted = false,
  cardRef,
}: {
  entry: GlossaryTerm;
  styles: ReturnType<typeof createStyles>;
  highlighted?: boolean;
  cardRef?: (node: ViewType | null) => void;
}) {
  const categoryStyle = CATEGORY_COLORS[entry.category];

  return (
    <View ref={cardRef} style={[styles.termCard, highlighted ? styles.termCardHighlighted : null]}>
      <View style={styles.termHeader}>
        <Text style={styles.termTitle}>{entry.term}</Text>
        <View style={[styles.categoryBadge, { backgroundColor: categoryStyle.bg }]}>
          <Text style={[styles.categoryBadgeText, { color: categoryStyle.text }]}>{entry.category}</Text>
        </View>
      </View>
      <Text style={styles.termDefinition}>{entry.definition}</Text>
      {entry.related?.length ? (
        <Text style={styles.termRelated}>
          Voir aussi :{' '}
          {entry.related
            .map((relatedId) => {
              const related = MDM_GLOSSARY.find((item) => item.id === relatedId);
              return related?.term.split('(')[0]?.trim() ?? related?.term;
            })
            .filter(Boolean)
            .join(' · ')}
        </Text>
      ) : null}
    </View>
  );
}

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    content: { padding: 24, paddingBottom: 40 },
    backLink: { marginBottom: 12 },
    backLinkText: { color: colors.accent, fontWeight: '700', fontSize: 15 },
    heroCard: {
      backgroundColor: colors.accentStrong,
      borderRadius: colors.radiusLg,
      padding: 20,
      marginBottom: 16,
    },
    heroEyebrow: {
      color: 'rgba(255,255,255,0.9)',
      fontSize: 12,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    heroTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', marginTop: 8, lineHeight: 28 },
    heroCopy: { color: 'rgba(255,255,255,0.88)', marginTop: 8, lineHeight: 21, fontSize: 14 },
    searchCard: {
      backgroundColor: colors.bgSoft,
      borderRadius: colors.radiusLg,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchLabel: { color: colors.fg, fontWeight: '800', fontSize: 14, marginBottom: 8 },
    searchInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      color: colors.fg,
      fontSize: 16,
      backgroundColor: colors.bg,
    },
    filterLabel: {
      color: colors.muted,
      fontSize: 12,
      fontWeight: '800',
      textTransform: 'uppercase',
      marginTop: 14,
      marginBottom: 8,
    },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.bg,
    },
    chipSelected: { backgroundColor: colors.accent, borderColor: colors.accent },
    chipText: { color: colors.fg, fontWeight: '700', fontSize: 13 },
    chipTextSelected: { color: '#FFFFFF' },
    termList: { gap: 12 },
    termCard: {
      backgroundColor: colors.bgSoft,
      borderRadius: 18,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    termCardHighlighted: {
      borderColor: colors.accent,
      borderWidth: 2,
    },
    termHeader: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
    termTitle: { color: colors.fg, fontSize: 17, fontWeight: '800', flexShrink: 1 },
    categoryBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
    categoryBadgeText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
    termDefinition: { color: colors.fg, marginTop: 10, lineHeight: 22, fontSize: 14 },
    termRelated: { color: colors.muted, marginTop: 10, fontSize: 12, lineHeight: 18 },
    emptyCard: {
      backgroundColor: colors.bgSoft,
      borderRadius: 18,
      padding: 20,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    emptyTitle: { color: colors.fg, fontSize: 17, fontWeight: '800' },
    emptyText: { color: colors.muted, marginTop: 8, textAlign: 'center', lineHeight: 20 },
    resetButton: {
      marginTop: 14,
      backgroundColor: colors.accent,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    resetButtonText: { color: '#FFFFFF', fontWeight: '800' },
  });
}
