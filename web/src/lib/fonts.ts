import { Inter, Plus_Jakarta_Sans } from 'next/font/google';

/** Corps de texte — Inter */
export const bodyFont = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

/** Titres, logo, accueil — Plus Jakarta Sans */
export const displayFont = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

/** Alias conservé pour le layout (identique à displayFont). */
export const headerFont = displayFont;
