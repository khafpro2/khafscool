import { Tabs } from 'expo-router';
import { Text } from 'react-native';

function TabIcon({ glyph, color }: { glyph: string; color: string }) {
  return <Text style={{ fontSize: 22, color }}>{glyph}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0070D2',
        tabBarInactiveTintColor: '#6E6E73',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E5EA',
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
          tabBarIcon: ({ color }) => <TabIcon glyph={'\u{1F3E0}'} color={color} />,
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
  );
}
