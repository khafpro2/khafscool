import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { QuestTabDot } from '../../src/components/QuestTabDot';
import { StreakNavBadge } from '../../src/components/StreakNavBadge';
import { useAppTheme } from '../../src/context/ThemeContext';

function TabIcon({ glyph, color, showQuestDot = false }: { glyph: string; color: string; showQuestDot?: boolean }) {
  return (
    <View style={{ position: 'relative' }}>
      <Text style={{ fontSize: 22, color }}>{glyph}</Text>
      {showQuestDot ? <QuestTabDot /> : null}
    </View>
  );
}

export default function TabsLayout() {
  const { colors } = useAppTheme();

  return (
    <View style={{ flex: 1 }}>
      <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: colors.tabBarBg,
          borderTopColor: colors.tabBarBorder,
          paddingTop: 4,
          height: 60,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color }) => <TabIcon glyph={'\u{1F3E0}'} color={color} showQuestDot />,
        }}
      />
      <Tabs.Screen
        name="courses"
        options={{
          title: 'Parcours',
          tabBarIcon: ({ color }) => <TabIcon glyph={'\u{1F4DA}'} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => <TabIcon glyph={'\u{1F464}'} color={color} />,
        }}
      />
    </Tabs>
      <View
        style={{ position: 'absolute', bottom: 66, right: 12, zIndex: 10 }}
        pointerEvents="none"
      >
        <StreakNavBadge />
      </View>
    </View>
  );
}
