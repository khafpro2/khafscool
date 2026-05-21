import * as SecureStore from 'expo-secure-store';

export const THEME_STORAGE_KEY = 'mdm-academy-theme';

export type ThemePreference = 'light' | 'dark' | 'system';

export async function getStoredThemePreference(): Promise<ThemePreference | null> {
  try {
    const stored = await SecureStore.getItemAsync(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
  } catch {
    /* stockage indisponible */
  }
  return null;
}

export async function persistThemePreference(preference: ThemePreference): Promise<void> {
  try {
    await SecureStore.setItemAsync(THEME_STORAGE_KEY, preference);
  } catch {
    /* ignore */
  }
}
