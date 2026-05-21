import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import type { AppThemeColors } from '../lib/design';
import { getThemeColors } from '../lib/design';
import {
  getStoredThemePreference,
  persistThemePreference,
  type ThemePreference,
} from '../lib/theme-preference';

type ThemeContextValue = {
  preference: ThemePreference;
  resolved: 'light' | 'dark';
  colors: AppThemeColors;
  setPreference: (next: ThemePreference) => void;
  cyclePreference: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const PREFERENCE_CYCLE: ThemePreference[] = ['system', 'light', 'dark'];

function resolveTheme(preference: ThemePreference, systemScheme: 'light' | 'dark' | null | undefined) {
  if (preference === 'system') {
    return systemScheme === 'dark' ? 'dark' : 'light';
  }
  return preference;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    void getStoredThemePreference().then((stored) => {
      if (stored) setPreferenceState(stored);
      setHydrated(true);
    });
  }, []);

  const resolved = resolveTheme(preference, systemScheme);
  const colors = useMemo(() => getThemeColors(resolved), [resolved]);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    void persistThemePreference(next);
  }, []);

  const cyclePreference = useCallback(() => {
    const index = PREFERENCE_CYCLE.indexOf(preference);
    const next = PREFERENCE_CYCLE[(index + 1) % PREFERENCE_CYCLE.length];
    setPreference(next);
  }, [preference, setPreference]);

  const value = useMemo(
    () => ({
      preference,
      resolved,
      colors,
      setPreference,
      cyclePreference,
    }),
    [preference, resolved, colors, setPreference, cyclePreference]
  );

  return (
    <ThemeContext.Provider value={value}>
      <StatusBar style={resolved === 'dark' ? 'light' : 'dark'} />
      {hydrated ? children : null}
    </ThemeContext.Provider>
  );
}

export function useAppTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useAppTheme doit être utilisé dans ThemeProvider');
  }
  return ctx;
}

export function preferenceLabel(preference: ThemePreference): string {
  switch (preference) {
    case 'light':
      return 'Mode clair';
    case 'dark':
      return 'Mode sombre';
    default:
      return 'Thème système';
  }
}
