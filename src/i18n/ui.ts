import { en } from './locales/en';
import { es } from './locales/es';
import { ja } from './locales/ja';
import { fr } from './locales/fr';
import { de } from './locales/de';
import { pt } from './locales/pt';
import { ko } from './locales/ko';
import { it } from './locales/it';

export const languages = {
  en: 'English',
  es: 'Español',
  ja: '日本語',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
  ko: '한국어',
  it: 'Italiano',
};

export const defaultLang = 'en';

export const ui = {
  en,
  es,
  ja,
  fr,
  de,
  pt,
  ko,
  it
} as const;
